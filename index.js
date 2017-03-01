#!/usr/bin/env node

var wild = require('./src/wild');
var geoc = require('./src/geoc');

var argv = require('minimist')(process.argv.slice(2));
var action = argv._[0];
switch (action) {
  case 'wild':
    wild.build(argv.file, argv.country, argv.iata || '*');
    break;
  case 'geoc':
    geoc.build(argv.file);
    break;
  case 'geocfull':
    geoc.full(argv.source, argv.result, argv.coords);
    break;
  default:
    console.log('unknown command');
}