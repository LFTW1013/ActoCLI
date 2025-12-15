// commands/print.js
module.exports = function(printLine, args) {
  if (!args || args.length === 0) {
    printLine('Usage: print [text]');
    return;
  }

  printLine(args.join(' '));
};
