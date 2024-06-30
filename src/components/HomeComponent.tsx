import React, { useState, useEffect } from 'react';

const HomeComponent = () => {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRunCommand = async () => {
        setIsLoading(true);
        // const scriptPath = "C:/git/ElectronWebpackTSApp/src/scripts/GetProductItems.ps1";
        // const result = await window.electron.executePowerShell(scriptPath, ["-environment", "Production"]);
        // setOutput(result);

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
            <button onClick={handleRunCommand}>Run Command</button>
            <pre>{output}</pre>
        </div>
    );
};

export default HomeComponent;
