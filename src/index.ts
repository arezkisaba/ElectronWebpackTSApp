import { app, BrowserWindow, ipcMain } from 'electron';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
import { exec } from 'child_process';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { ExpectedProduct } from './models/ExpectedProduct';
import { InstalledProduct } from './models/InstalledProduct';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        fullscreen: false,
        height: 600,
        width: 800,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('read-file', async (event, filePath : string) => {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

ipcMain.handle('execute-powershell', async (event, scriptPath : string, args : string[]) => {
    return new Promise((resolve, reject) => {
        const command = `powershell -File "${scriptPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
            } else if (stderr) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
});

ipcMain.handle('get-expected-products', async (event, content) => {
    return getExpectedProducts(content);
});

ipcMain.handle('get-installed-products', async (event, content) => {
    return getInstalledProducts(content);
});

function getExpectedProducts(content: string): Promise<ExpectedProduct[]> {
    return new Promise((resolve, reject) => {
        const records: ExpectedProduct[] = [];
        parse(content, { columns: true, trim: true })
            .on('data', (row) => {
                records.push(row);
            })
            .on('end', () => {
                resolve(records);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

function getInstalledProducts(content: string): Promise<InstalledProduct[]> {
    return new Promise((resolve, reject) => {
        const records: InstalledProduct[] = [];
        parse(content, { columns: true, trim: true })
            .on('data', (row) => {
                records.push(row);
            })
            .on('end', () => {
                resolve(records);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
