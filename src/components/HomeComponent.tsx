import React, { useState, useEffect } from 'react';
import { HomeComponentItemViewModel } from './HomeComponentItemViewModel';
import { CsvRecord } from '../CsvRecord';

interface HomeComponentProps {
    someProp: string;
}

const HomeComponent: React.FC<HomeComponentProps> = ({ someProp }) => {
    const [output, setOutput] = useState('');
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
        const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/config/Production.csv";
        const result = await window.electron.readFile(scriptPath);
        const records = await window.electron.parseCsv(result);

        let i = 1;
        for (const record of records) {
            const isProtocolOk = await window.electron.executePowerShell(
                "C:/git/ElectronWebpackTSApp/src/scripts/IsProtocolOk.ps1",
                ["-appName", record.Name, "-protocol", record.Protocol]
            );
            const isBristolRunning = await window.electron.executePowerShell(
                "C:/git/ElectronWebpackTSApp/src/scripts/IsBristolRunning.ps1",
                ["-appName", record.Name]
            );
            const item: HomeComponentItemViewModel = {
                id: i,
                name: record.Name,
                isProtocolOk: isProtocolOk.trim().toLocaleLowerCase() == "true", 
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
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // useEffect(() => {
    //     console.log('Component mounted or updated');
    //     startScan();

    //     return () => {
    //         console.log('Component will unmount');
    //     };
    // }, []);

    // const handleButton2 = async () => {
    //     setIsLoading(true);
    //     const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/GetProductItems.ps1";
    //     const result = await window.electron.executePowerShell(scriptPath, ["-environment", "Production"]);
    //     setOutput(result);
    //     setIsLoading(false);
    // };

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // return (
    //     <div>
    //         <h1>Electron System Command Executor</h1>
    //         <pre>{output}</pre>
    //         <table>
    //             <thead>
    //                 <tr>
    //                     <th>Name</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {rows.map((row) => (
    //                     <tr key={row.id}>
    //                         <td>{row.name}</td>
    //                     </tr>
    //                 ))}
    //             </tbody>
    //         </table>
    //     </div>
    // );
};

export default HomeComponent;
