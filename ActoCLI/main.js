// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// --- Silence EGL GPU warnings on Mac ---
process.env.ELECTRON_ENABLE_LOGGING = "false";

let mainWindow;

function createWindow() {
  // --- BrowserWindow setup ---
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
    
    icon: process.platform === 'darwin' 
      ? undefined 
      : path.join(__dirname, 'assets', 'icon.ico'),
    title: "ActoCLI"
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  
  if (process.platform === 'darwin') {
    try {
      const macIconPath = path.resolve(__dirname, 'assets', 'icon.icns');
      console.log('Setting Mac dock icon:', macIconPath);
      app.dock.setIcon(macIconPath);
    } catch (err) {
      console.error('Failed to set Mac dock icon:', err);
    }
  }
}


ipcMain.on('exit-app', () => {
  app.quit();
});

// --- App lifecycle events ---
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
