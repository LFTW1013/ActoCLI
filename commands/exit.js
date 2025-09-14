const { ipcRenderer } = require('electron');

function exit(printLine) {
  printLine('Exiting ActoCLI...');
  ipcRenderer.send('exit-app');
}

module.exports = exit;
