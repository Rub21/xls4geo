#!/usr/bin/env node

var wild = require('./src/wild');
var argv = require('minimist')(process.argv.slice(2));
var action = argv._[0];
switch (action) {
  case 'wild':
    wild.build(argv.file, argv.iata || '*');
    break;
  default:
    console.log('unknown command');
}