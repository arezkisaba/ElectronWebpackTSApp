export interface IElectronAPI {
    readFile: (filePath: string) => Promise<string>;
    executePowerShell: (scriptPath: string, args: string[]) => Promise<string>;
    platform: string;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}