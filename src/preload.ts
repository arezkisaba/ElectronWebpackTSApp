import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    getExpectedProducts: (content: string) => ipcRenderer.invoke('get-expected-products', content),
    getInstalledProducts: (content: string) => ipcRenderer.invoke('get-installed-products', content),
    executePowerShell: (scriptPath: string, args: string[]) => ipcRenderer.invoke('execute-powershell', scriptPath, args),
    platform: process.platform
});
