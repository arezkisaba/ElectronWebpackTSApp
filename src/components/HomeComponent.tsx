import React, { useState, useEffect } from 'react';

const HomeComponent = () => {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRunCommand = () => {
        setIsLoading(true);
        window.electron.runPowerShellCommand('Get-AppxPackage');
    };

    useEffect(() => {
        window.electron.onPowerShellCommandResult((result) => {
            setOutput(result);
            setIsLoading(false);
        });
    }, []);

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
