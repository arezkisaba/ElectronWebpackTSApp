import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    parseCsv: (content: string) => ipcRenderer.invoke('parse-csv', content),
    executePowerShell: (scriptPath: string, args: string[]) => ipcRenderer.invoke('execute-powershell', scriptPath, args),
    platform: process.platform
});
