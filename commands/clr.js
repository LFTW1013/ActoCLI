// commands/clr.js
function clr(terminal) {
    // Remove everything in the terminal
    while (terminal.firstChild) {
        terminal.removeChild(terminal.firstChild);
    }
}

module.exports = clr;
