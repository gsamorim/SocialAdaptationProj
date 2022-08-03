export class TxtWorker {
  tokensToTxt(json, fileName) {
    // Requiring fs module in which
    // writeFile function is defined.
    const fs = require("fs");

    // Write data in 'Output.txt' .
    fs.writeFile(fileName, json, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  }
}
