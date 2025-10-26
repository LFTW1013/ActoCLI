// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

process.env.ELECTRON_ENABLE_LOGGING = "false";

let mainWindow;
const THEME_FILE = path.join(__dirname, 'theme.json');

function createWindow() {
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

  // Send saved theme to renderer after load
  mainWindow.webContents.on('did-finish-load', () => {
    if (fs.existsSync(THEME_FILE)) {
      const data = JSON.parse(fs.readFileSync(THEME_FILE, 'utf-8'));
      mainWindow.webContents.send('apply-theme', data);
    }
  });

  if (process.platform === 'darwin') {
    try {
      const macIconPath = path.resolve(__dirname, 'assets', 'icon.icns');
      app.dock.setIcon(macIconPath);
    } catch (err) {
      console.error('Failed to set Mac dock icon:', err);
    }
  }
}

// App lifecycle
app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// Exit
ipcMain.on('exit-app', () => app.quit());

// Save theme
ipcMain.on('save-theme', (event, themeData) => {
  fs.writeFileSync(THEME_FILE, JSON.stringify(themeData));
});
