import React, { useState, useEffect } from 'react';

const HomeComponent = () => {   
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleButton1 = async () => {
        setIsLoading(true);
        const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/config/Production.csv";
        const result = await window.electron.readFile(scriptPath);
        setOutput(result);
        setIsLoading(false);
    };

    const handleButton2 = async () => {
        setIsLoading(true);
        const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/GetProductItems.ps1";
        const result = await window.electron.executePowerShell(scriptPath, ["-environment", "Production"]);
        setOutput(result);
        setIsLoading(false);
    };

    const handleButton3 = async () => {
        setIsLoading(true);
        const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/IsBristolRunning.ps1";
        const result = await window.electron.executePowerShell(scriptPath, ["-appName", "Prevoir.Octav"]);
        setOutput(result);
        setIsLoading(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Electron System Command Executor</h1>
            <button onClick={handleButton1}>Get configuration</button>
            <button onClick={handleButton2}>Get product items</button>
            <button onClick={handleButton3}>Is bristol running</button>
            <pre>{output}</pre>
        </div>
    );
};

export default HomeComponent;
