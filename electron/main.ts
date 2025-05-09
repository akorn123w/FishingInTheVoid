import { app, BrowserWindow } from 'electron'
import path from 'path'

const isDev = !app.isPackaged

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: process.env.VITE_DEV_MODE === 'true'
        }
    })

    // In development, load from the dev server
    if (isDev) {
        win.loadURL('http://localhost:5173')
    } else {
        // In production, load the built files
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})