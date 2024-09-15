import React, { useState, useEffect } from 'react';
import { HomeComponentItemViewModel } from './HomeComponentItemViewModel';
import PowershellAdapterService from '../infrastructure/adapters/PowershellAdapterService';

interface HomeComponentProps {
    parameters: string[];
}

const HomeComponent: React.FC<HomeComponentProps> = ({ parameters }) => {
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isLoadingInstalledProducts, setIsLoadingInstalledProducts] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState<HomeComponentItemViewModel[]>([]);
    const bridgeService = new PowershellAdapterService();

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
        const expectedProducts = await bridgeService.getExpectedProducts();
        setIsLoadingConfig(false);

        setIsLoadingInstalledProducts(true);
        const installedProducts = await bridgeService.getInstalledProducts();
        setIsLoadingInstalledProducts(false);

        let i = 1;
        for (const configRecord of expectedProducts) {
            const match = installedProducts.find(installedProduct => installedProduct.ApplicationName === configRecord.Name);
            const applicationVersion = match?.ApplicationVersion ?? "N/A";
            const isApplicationVersionOk = match ? match.ApplicationVersion === configRecord.Version : false;
            const isBristolVersionOk = match ? match.BristolVersion === configRecord.Version : false;
            const isUwpVersionOk = match ? match.UWPVersion === configRecord.Version : false;
            const isProtocolOk = await bridgeService.isProtocolOk(configRecord);
            const isBristolRunning = await bridgeService.isBristolRunning(configRecord);
            const item : HomeComponentItemViewModel = {
                id: i,
                name: configRecord.Name,
                version: applicationVersion,
                isApplicationVersionOk: isApplicationVersionOk,
                isBristolVersionOk: isBristolVersionOk,
                isUwpVersionOk: configRecord.HasUI === "False" || isUwpVersionOk,
                isProtocolOk: configRecord.HasUI === "False" || isProtocolOk,
                isBristolRunning: isBristolRunning,
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
