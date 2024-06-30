export interface IElectronAPI {
    executePowerShell: (scriptPath: string, args: string[]) => Promise<string>;
    platform: string;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}