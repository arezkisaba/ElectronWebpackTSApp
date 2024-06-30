export interface HomeComponentItemViewModel {
    id: number;
    name: string;
    version: string;
    isApplicationVersionOk: boolean;
    isBristolVersionOk: boolean;
    isUwpVersionOk: boolean;
    isProtocolOk: boolean;
    isBristolRunning: boolean;
}
