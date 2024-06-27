export interface IElectronAPI {
    runCommand: (command: string) => void;
    onCommandResult: (callback: (result: string) => void) => void;
    platform: string;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}