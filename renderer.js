// renderer.js
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Built-in commands
const help = require('./commands/help.js');
const greet = require('./commands/greet.js');
const exit = require('./commands/exit.js');
const clr = require('./commands/clr.js');
const configTheme = require('./commands/configTheme.js');
const print = require('./commands/print.js');

const terminal = document.getElementById('terminal');
let currentCommand = '';
let inputLine;
let history = [];
let historyIndex = -1;
let nextInputHandler = null;
const THEME_FILE = path.join(__dirname, 'theme.json');

function setNextInputHandler(handler) {
  nextInputHandler = handler;
}

function createPrompt() {
  inputLine = document.createElement('span');
  inputLine.classList.add('input-line');
  inputLine.textContent = 'ActoCLI> ';
  terminal.appendChild(inputLine);

  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  cursor.textContent = ' ';
  terminal.appendChild(cursor);

  // Apply saved theme
  if (fs.existsSync(THEME_FILE)) {
    const data = JSON.parse(fs.readFileSync(THEME_FILE, 'utf-8'));
    applyTheme(data);
  }

  terminal.scrollTop = terminal.scrollHeight;
}

function printLine(text = '') {
  const line = document.createElement('div');
  line.textContent = text;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function applyTheme(theme) {
  if (!terminal) return;
  if (theme.text) terminal.style.color = theme.text;
  if (theme.background) terminal.style.backgroundColor = theme.background;
}

function runCommand(cmd) {
  const parts = cmd.trim().split(' ');
  const mainCmd = parts[0]?.toLowerCase();

  // Run .acto script
  if (mainCmd === 'run' && parts[1]) {
    const scriptName = parts[1].replace(/\.acto$/, '');
    printLine(`▶️ Running script: ${scriptName}.acto`);
    ipcRenderer.send('run-script', scriptName);
    return;
  }

  // handle config theme
  if (mainCmd === 'config' && parts[1]?.toLowerCase() === 'theme') {
    configTheme(printLine, terminal, setNextInputHandler, ipcRenderer);
    return;
  }

  switch (mainCmd) {
    case 'help': help(printLine); break;
    case 'greet': greet(printLine); break;
    case 'exit': exit(printLine); break;
    case 'clr': clr(terminal); break;
    case 'print': print(printLine, parts.slice(1)); break;
    case 'ai':
      if (parts[1]?.toLowerCase() === 'mode') {
        aiMode(printLine, terminal, setNextInputHandler, ipcRenderer);
        return;
      }
      break;
    default:
      if (cmd.trim() !== '')
        printLine('Unknown command. Type "help" for a list of commands.');
  }
}

// 🎬 Execute parsed Acto script sent from main.js
ipcRenderer.on('execute-acto-script', async (event, commandsToRun) => {
  printLine('--- Starting Acto Script Execution ---');

  for (const { type, command } of commandsToRun) {
    if (type === 'a') {
      const [cmdName, ...args] = command.split(' ');
      const cmdPath = path.join(__dirname, 'commands', `${cmdName}.js`);

      try {
        if (fs.existsSync(cmdPath)) {
          const cmd = require(cmdPath);
          if (typeof cmd === 'function') {
            cmd(printLine, terminal, setNextInputHandler, ipcRenderer, ...args);
          } else {
            printLine(`⚠️ Invalid command module: ${cmdName}`);
          }
        } else {
          printLine(`❌ Unknown Acto command: ${cmdName}`);
        }
      } catch (err) {
        printLine(`❌ Error executing ${cmdName}: ${err.message}`);
      }
    } else if (type === '!') {
      // Optional: System command placeholder
      printLine(`⚙️ (System command ignored for safety): ${command}`);
    }
  }

  printLine('--- End of Script ---');
  createPrompt();
});

// Capture keys
document.addEventListener('keydown', (e) => {
  if (!inputLine) return;

  if (e.key === 'Backspace') {
    if (currentCommand.length > 0) currentCommand = currentCommand.slice(0, -1);
    inputLine.textContent = 'ActoCLI> ' + currentCommand;
  } else if (e.key === 'Enter') {
    const finishedLine = document.createElement('div');
    finishedLine.textContent = 'ActoCLI> ' + currentCommand;
    terminal.insertBefore(finishedLine, inputLine);
    terminal.removeChild(inputLine);

    const cursor = terminal.querySelector('.cursor');
    if (cursor) cursor.remove();

    if (nextInputHandler) {
      const handler = nextInputHandler;
      nextInputHandler = null;
      handler(currentCommand, () => createPrompt());
      currentCommand = '';
      return;
    }

    if (currentCommand.trim() !== '') {
      history.push(currentCommand);
      historyIndex = history.length;
    }

    runCommand(currentCommand);
    currentCommand = '';
    createPrompt();
  } else if (e.key === 'ArrowUp') {
    if (history.length > 0 && historyIndex > 0) {
      historyIndex--;
      currentCommand = history[historyIndex];
      inputLine.textContent = 'ActoCLI> ' + currentCommand;
    }
  } else if (e.key === 'ArrowDown') {
    if (history.length > 0 && historyIndex < history.length - 1) {
      historyIndex++;
      currentCommand = history[historyIndex];
    } else {
      historyIndex = history.length;
      currentCommand = '';
    }
    inputLine.textContent = 'ActoCLI> ' + currentCommand;
  } else if (e.key.length === 1) {
    currentCommand += e.key;
    inputLine.textContent = 'ActoCLI> ' + currentCommand;
  }

  terminal.scrollTop = terminal.scrollHeight;
});

// Capture paste
document.addEventListener('paste', (e) => {
  if (!inputLine) return;
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  currentCommand += pastedText;
  inputLine.textContent = 'ActoCLI> ' + currentCommand;
  terminal.scrollTop = terminal.scrollHeight;
  e.preventDefault();
});

// Apply theme from main
ipcRenderer.on('apply-theme', (theme) => applyTheme(theme));

printLine('Welcome to ActoCLI! Type "help" for commands.');
createPrompt();

