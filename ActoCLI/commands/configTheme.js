// commands/configTheme.js

module.exports = function(printLine, terminal, setNextInputHandler, ipcRenderer) {
  printLine('_______________________________________');
  printLine('THEME CONFIGURATION:');
  printLine('Eg: for RGB colors set like "rgb(255,0,0)" or for HEX "#00FF00"');

  // Step 1: text color
  printLine('Input color value for text:');
  setNextInputHandler((textColor, done) => {
    const finalTextColor = parseColor(textColor) || terminal.style.color || '#FFFFFF';

    // Step 2: background color
    printLine('Input color value for background:');
    setNextInputHandler((bgColor, done2) => {
      const finalBgColor = parseColor(bgColor) || terminal.style.backgroundColor || '#000000';

      terminal.style.color = finalTextColor;
      terminal.style.backgroundColor = finalBgColor;

      // Save theme to disk
      if (ipcRenderer) {
        ipcRenderer.send('save-theme', { text: finalTextColor, background: finalBgColor });
      }

      printLine('Theme changed successfully!');
      printLine('_______________________________________');
      done2();
    });

    done();
  });

  // Helper: convert "255,0,0" => "rgb(255,0,0)"
  function parseColor(input) {
    if (!input) return null;
    input = input.trim();
    if (/^\d+,\d+,\d+$/.test(input)) return `rgb(${input})`;
    return input; // assume HEX or valid CSS
  }
};
