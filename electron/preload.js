const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        windowState: {
            onStateChange: (callback) => {
                ipcRenderer.on('window-state-change', (_, state) => callback(state));
            }
        }
    }
);