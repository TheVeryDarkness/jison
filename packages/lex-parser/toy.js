const Fs = require('fs');
const lexParser = require('.');
console.log(lexParser);
const res = lexParser.parse(Fs.readFileSync('./toy.l', 'utf-8'));
console.log(res);
