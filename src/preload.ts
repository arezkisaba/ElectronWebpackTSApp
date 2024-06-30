import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    parseConfig: (content: string) => ipcRenderer.invoke('parse-config', content),
    parseInstalledProducts: (content: string) => ipcRenderer.invoke('parse-installed-products', content),
    executePowerShell: (scriptPath: string, args: string[]) => ipcRenderer.invoke('execute-powershell', scriptPath, args),
    platform: process.platform
});
