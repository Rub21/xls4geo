var fs = require('fs');
var _ = require('underscore');
var XLSX = require('xlsx');
var fastl = require('fast-levenshtein');
var path = require('path');
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
  'racetracks',
  'nightlife',
  'citywide'
  // 'venues'
];
module.exports = {
  build: function(file, iata) {
    iata = iata.toLowerCase();
    var folder = path.basename(file, '.xlsx').replace(/\s/g, '-');
    var workbook = XLSX.readFile(file, {
      sheetStubs: true,
      cellStyles: true

    });
    var sheets = workbook.SheetNames;
    var sheetLists = workbook.SheetNames;
    var xlsObjs = {};
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
      fs.mkdirSync(path.join(folder, 'wild'));
    }
    var Sheetscolums = {};
    sheetLists.forEach(function(sheet) {
      var worksheet = workbook.Sheets[sheet];
      xlsObjs[sheet] = {};
      //Num avaliable colums
      var colums = [];
      var rows = [];
      for (z in worksheet) {
        if (z[0] === '!') continue;
        var row = z.match(/\d+$/)[0];
        var colum = z.replace(/[^a-zA-Z]+/g, '');
        if (row === '1') {
          colums.push(colum);
        } else {
          if (!rows[row]) {
            rows[row] = {};
            rows[row][colum] = worksheet[z].v || false;
          } else {
            rows[row][colum] = worksheet[z].v || false;
          }
        }
      }
      //Num avaliable rows
      var numRows = 3;
      for (var i = 0; i < rows.length; i++) {
        var row = _.values(rows[i]);
        numCool = _.without(rows[i], false).length;
        if (numCool !== 0) {
          numRows++;
        }
      }

      for (k in worksheet) {
        if (k[0] === '!') continue;
        var row = k.match(/\d+$/)[0];
        var colum = k.replace(/[^a-zA-Z]+/g, '');
        if (colums.indexOf(colum) > -1 && row < numRows) {
          if (xlsObjs[sheet][row]) {
            if (row === '1') {
              var nameColum = trim(worksheet[k].v.toString()).replace(/\s/g, '').replace(/\//g, '');
              xlsObjs[sheet][row].push(nameColum);
              Sheetscolums[sheet].push(nameColum);
            } else {
              xlsObjs[sheet][row].push(quotation(trim((worksheet[k].v || '').toString())));
            }
          } else {
            if (row === '1') {
              var nameColum = trim(worksheet[k].v.toString()).replace(/\s/g, '').replace(/\//g, '');
              xlsObjs[sheet][row] = [nameColum];
              Sheetscolums[sheet] = [nameColum];
            } else {
              xlsObjs[sheet][row] = [quotation(trim((worksheet[k].v || '').toString()))];
            }
          }
        }
      }
    });
    var flag = 0;
    var filesNames = [];
    writeFileCSV(sheetLists[flag], xlsObjs[sheetLists[flag]], Sheetscolums[sheetLists[flag]]);

    function writeFileCSV(nameSheet, sheetValue, headers) {
      var rows = sort(sheetValue, headers);
      var valueRows = rows.join('\n');
      var nameFile = nameSheet = nameSheet.toLowerCase().replace(/\s/g, '') + '-';
      for (var i = 0; i < placesType.length; i++) {
        if (nameSheet.includes(placesType[i]) || fastl.get(nameSheet, placesType[i]) < 3) {
          nameFile = placesType[i];
        }
      }
      if (nameSheet == nameFile) {
        nameFile = nameSheet + '-RENAME';
      }
      var csvFile = 'aa-poi-' + iata + '-' + nameFile + '.csv';
      filesNames.push(csvFile);
      fs.writeFile(path.join(folder, 'wild', csvFile), valueRows, function(err) {
        if (err) return console.log(err);
        flag++;
        if (flag < sheetLists.length) {
          writeFileCSV(sheetLists[flag], xlsObjs[sheetLists[flag]], Sheetscolums[sheetLists[flag]]);
        } else {
          console.log(filesNames.join('\n'));
        }
      });
    }
  }
};

function trim(str) {
  str = str.replace(/^\s+/, '');
  for (var i = str.length - 1; i >= 0; i--) {
    if (/\S/.test(str.charAt(i))) {
      str = str.substring(0, i + 1);
      break;
    }
  }
  return str;
}

function quotation(str) {
  if (str.indexOf(',') > -1)
    return JSON.stringify(str);
  return str;
}

function sort(body, headers) {
  var rows = _.values(body);
  var rowsObjs = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var rowObj = {};
    _.each(headers, function(k, i) {
      rowObj[k] = row[i];
    });
    rowsObjs.push(rowObj);
  }
  rowsObjs.sort(function(a, b) {
    return parseInt(a.Importance) - parseInt(b.Importance);
  }).reverse();
  var sortObjs = [];
  for (var y = 0; y < rowsObjs.length; y++) {
    var values = _.values(rowsObjs[y]);
    if (_.compact(values).length > 0 && _.intersection(values, headers).length !== headers.length) {
      sortObjs.push(values);
    }
  }
  sortObjs.unshift(headers);
  return sortObjs;
}