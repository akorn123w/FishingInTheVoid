const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Suppress security warnings in development
if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

// Set CSP headers
function setCSPHeaders() {
    // In development, we need 'unsafe-eval' for Vite and React DevTools
    // This warning is expected and will not appear in production
    const cspDirectives = [
        "default-src 'self'",
        isDev
            ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*" // Development needs unsafe-eval for Vite
            : "script-src 'self'", // Production is strict
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        isDev
            ? "connect-src 'self' http://localhost:* ws://localhost:*"
            : "connect-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "media-src 'self'",
        "frame-src 'none'"
    ];

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [cspDirectives.join('; ')]
            }
        });
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev,
            webSecurity: true,
            allowRunningInsecureContent: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-state-change', 'maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-state-change', 'unmaximized');
    });

    if (!isDev) {
        mainWindow.webContents.on('will-navigate', (event) => {
            event.preventDefault();
        });
    }
}

// Ensure CSP is set before creating any windows
app.whenReady().then(() => {
    setCSPHeaders();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}