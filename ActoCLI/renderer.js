// renderer.js

// Import commands (CommonJS style)
const help = require('./commands/help.js');
const greet = require('./commands/greet.js');
const exit = require('./commands/exit.js');
const clr = require('./commands/clr.js');


const terminal = document.getElementById('terminal');
let currentCommand = '';
let inputLine;
let history = [];
let historyIndex = -1;

function createPrompt() {
  inputLine = document.createElement('span');
  inputLine.classList.add('input-line');
  inputLine.textContent = 'ActoCLI> ';
  terminal.appendChild(inputLine);

  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  cursor.textContent = ' '; 
  terminal.appendChild(cursor);

  terminal.scrollTop = terminal.scrollHeight;
}

function printLine(text = '') {
  const line = document.createElement('div');
  line.textContent = text;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function runCommand(cmd) {
  switch (cmd.toLowerCase()) {
    case 'help':
      help(printLine);
      break;
    case 'greet':
      greet(printLine);
      break;
    case 'exit':
      exit(printLine);
      break;
    case 'clr':
     clr(terminal);
     break;
    default:
      if (cmd.trim() !== '') {
        printLine('Unknown command. Type "help" for a list of commands.');
      }
  }
}

// Capture key presses
document.addEventListener('keydown', (e) => {
  if (!inputLine) return;

  if (e.key === 'Backspace') {
    if (currentCommand.length > 0) {
      currentCommand = currentCommand.slice(0, -1);
      inputLine.textContent = 'ActoCLI> ' + currentCommand;
    }
  } else if (e.key === 'Enter') {
    // Turn current input into finished line
    if (currentCommand.toLowerCase() !== 'clr') {
    const finishedLine = document.createElement('div');
    finishedLine.textContent = 'ActoCLI> ' + currentCommand;
    terminal.insertBefore(finishedLine, inputLine);
}
terminal.removeChild(inputLine);


    // Remove old cursor
    const cursor = terminal.querySelector('.cursor');
    if (cursor) cursor.remove();

    // Save to history
    if (currentCommand.trim() !== '') {
      history.push(currentCommand);
      historyIndex = history.length;
    }

    // Run command
    runCommand(currentCommand);

    // Reset and create fresh prompt
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

// Startup message
printLine('Welcome to ActoCLI! Type "help" for commands.');
createPrompt();

