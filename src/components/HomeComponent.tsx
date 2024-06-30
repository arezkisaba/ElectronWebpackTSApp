import React, { useState, useEffect } from 'react';
import { HomeComponentItemViewModel } from './HomeComponentItemViewModel';
import { ExpectedProduct } from '../models/ExpectedProduct';

interface HomeComponentProps {
    someProp: string;
}

const HomeComponent: React.FC<HomeComponentProps> = ({ someProp }) => {
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isLoadingInstalledProducts, setIsLoadingInstalledProducts] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState<HomeComponentItemViewModel[]>([]);

    useEffect(() => {
        console.log('Component mounted or updated');
        startScan();

        return () => {
            console.log('Component will unmount');
        };
    }, []);

    const startScan = async () => {
        setIsLoading(true);

        setIsLoadingConfig(true);
        const configFilePath = "C:/git/ElectronWebpackTSApp/src/scripts/config/Production.csv";
        const configFileCsv = await window.electron.readFile(configFilePath);
        const configRecords = await window.electron.parseConfig(configFileCsv);
        setIsLoadingConfig(false);

        setIsLoadingInstalledProducts(true);
        const installedProductsCsv = await window.electron.executePowerShell(
            "C:/git/ElectronWebpackTSApp/src/scripts/GetInstalledProducts.ps1",
            ["-environment", "Production"]
        );
        const installedProducts = await window.electron.parseInstalledProducts(installedProductsCsv);
        setIsLoadingInstalledProducts(false);

        let i = 1;
        for (const configRecord of configRecords) {
            const match = installedProducts.find(installedProduct => installedProduct.ApplicationName === configRecord.Name);
            const applicationVersion = match?.ApplicationVersion ?? "false";
            const isApplicationVersionOk = match ? match.ApplicationVersion === configRecord.Version : false;
            const isBristolVersionOk = match ? match.BristolVersion === configRecord.Version : false;
            const isUwpVersionOk = match ? match.UWPVersion === configRecord.Version : false;
            const isProtocolOk = await window.electron.executePowerShell(
                "C:/git/ElectronWebpackTSApp/src/scripts/IsProtocolOk.ps1",
                ["-appName", configRecord.Name, "-protocol", configRecord.Protocol]
            );
            const isBristolRunning = await window.electron.executePowerShell(
                "C:/git/ElectronWebpackTSApp/src/scripts/IsBristolRunning.ps1",
                ["-appName", configRecord.Name]
            );
            const item: HomeComponentItemViewModel = {
                id: i,
                name: configRecord.Name,
                version: applicationVersion,
                isApplicationVersionOk: isApplicationVersionOk,
                isBristolVersionOk: isBristolVersionOk,
                isUwpVersionOk: configRecord.HasUI === "False" || isUwpVersionOk,
                isProtocolOk: configRecord.HasUI === "False" || isProtocolOk.trim().toLocaleLowerCase() == "true",
                isBristolRunning: isBristolRunning.trim().toLocaleLowerCase() === "true",
            };
            addRow(item);
            i++;
        }

        setIsLoading(false);
    };

    const addRow = (item: HomeComponentItemViewModel) => {
        console.log(item);
        setRows((prevRows) => [
            ...prevRows,
            item
        ]);
    };

    return (
        <div>
            <h1>Dynamic Table</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Version</th>
                        <th>Version OK</th>
                        <th>Version UWP OK</th>
                        <th>Version Bristol OK</th>
                        <th>Bristol lancé</th>
                        <th>Protocole OK</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.version}</td>
                            <td>{row.isApplicationVersionOk ? "OK" : "KO"}</td>
                            <td>{row.isUwpVersionOk ? "OK" : "KO"}</td>
                            <td>{row.isBristolVersionOk ? "OK" : "KO"}</td>
                            <td>{row.isBristolRunning ? "OK" : "KO"}</td>
                            <td>{row.isProtocolOk ? "OK" : "KO"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HomeComponent;
