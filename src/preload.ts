import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    runCommand: (command: string) => ipcRenderer.send('run-command', command),
    onCommandResult: (callback: (result: string) => void) => ipcRenderer.on('command-result', (event, result) => callback(result)),
    runPowerShellCommand: (command: string) => ipcRenderer.send('run-powershell-command', command),
    onPowerShellCommandResult: (callback: (result: string) => void) => ipcRenderer.on('powershell-command-result', (event, result) => callback(result)),
    platform: process.platform
});
