
const shell = require('shelljs');

// shell.exec('cd /');

const result = shell.exec('cd ../../doc && dir');

// console.log(result);
console.log(`code:${result.code}\nerr: ${result.stderr}\nout:${result.stdout}`);

