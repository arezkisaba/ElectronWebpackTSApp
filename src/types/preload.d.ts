import { CsvRecord } from "../CsvRecord";

export interface IElectronAPI {
    readFile: (filePath: string) => Promise<string>;
    parseCsv: (content: string) => Promise<CsvRecord[]>;
    executePowerShell: (scriptPath: string, args: string[]) => Promise<string>;
    platform: string;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}