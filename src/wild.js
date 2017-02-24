var fs = require('fs');
var _ = require('underscore');
var XLSX = require('xlsx');
var fastl = require('fast-levenshtein');
var placesType = ['airports',
  'amusementparks',
  'barsclubs',
  'beaches',
  'hotels',
  'landmarks',
  'museums',
  'parks',
  'restaurants',
  'shopping',
  'stadiums',
  'touristdistricts',
  'transportation',
  'universities',
  'concertvenues',
  'theaters',
  'coffee',
  'worship',
  'libraries',
  'amusement',
  'racetracks'
];
module.exports = {
  build: function(file, iata) {
    var workbook = XLSX.readFile(file);
    var sheets = workbook.SheetNames;
    var sheetLists = workbook.SheetNames;
    var xlsObjs = {};
    sheetLists.forEach(function(sheet) {
      var worksheet = workbook.Sheets[sheet];
      xlsObjs[sheet] = {};
      for (k in worksheet) {
        if (k[0] === '!') continue;
        var row = k.match(/\d+$/)[0];
        if (xlsObjs[sheet][row]) {
          xlsObjs[sheet][row].push(worksheet[k].v);
        } else {
          xlsObjs[sheet][row] = [worksheet[k].v];
        }
      }
    });
    var flag = 0;
    var filesNames = [];
    writeFileCSV(sheetLists[flag], xlsObjs[sheetLists[flag]]);

    function writeFileCSV(nameSheet, sheetValue) {
      var rows = _.values(sheetValue);
      var valueRows = rows.join('\n');
      var nameFile = nameSheet = nameSheet.toLowerCase().replace(/\s/g, '');
      for (var i = 0; i < placesType.length; i++) {
        if (nameSheet.includes(placesType[i]) || fastl.get(nameSheet, placesType[i]) < 2) {
          nameFile = placesType[i];
        }
      }
      if (nameSheet == nameFile) {
        nameFile = nameSheet + '-RENAME';
      }
      var csvFile = 'aa-poi-' + iata + '-' + nameFile + '.csv';
      filesNames.push(csvFile);
      fs.writeFile(csvFile, valueRows, function(err) {
        if (err) return console.log(err);
        flag++;
        if (flag < sheetLists.length) {
          writeFileCSV(sheetLists[flag], xlsObjs[sheetLists[flag]]);
        } else {
          console.log('CSV files were created :\n' + filesNames.join('\n'));
        }
      });
    }
  }
};