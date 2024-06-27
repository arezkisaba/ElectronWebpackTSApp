import React, { useState, useEffect } from 'react';

const HomeComponent = () => {
    const [output, setOutput] = useState('');

    const handleRunCommand = () => {
        const command = window.electron.platform === 'win32' ? 'dir' : 'ls';
        console.log('window.electron.platform : ', window.electron.platform);
        window.electron.runCommand(command);
    };

    useEffect(() => {
        window.electron.onCommandResult((result) => {
            setOutput(result);
        });
    }, []);

    return (
        <div>
            <h1>Electron System Command Executor</h1>
            <button onClick={handleRunCommand}>Run Command</button>
            <pre>{output}</pre>
        </div>
    );
};

export default HomeComponent;
