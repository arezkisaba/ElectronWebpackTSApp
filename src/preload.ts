import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    executePowerShell: (scriptPath: string, args: string[]) => ipcRenderer.invoke('execute-powershell', scriptPath, args),
    platform: process.platform
});
