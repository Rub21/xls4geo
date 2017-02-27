var fs = require('fs');
var csv = require("fast-csv");
var path = require('path');
var numRowsAllowed = 20;

module.exports = {
  build: function(file) {
    var rows = [];
    var counterflag = 1;
    var stream = fs.createReadStream(file);
    csv.fromStream(stream, {
        headers: true
      })
      .on("data", function(data) {
        rows.push(data);
      })
      .on("end", function() {
        rows.sort(function(a, b) {
          return a.Importance - b.Importance;
        }).reverse();
        for (var i = 0; i < rows.length; i++) {
          if (i < numRowsAllowed) {
            if (rows[i].EnglishNameTranslation) {
              console.log(rows[i].EnglishNameTranslation + ',' + rows[i].Longitude + ',' + rows[i].Latitude);
            } else {
              console.log(rows[i].LocalName + ',' + rows[i].Longitude + ',' + rows[i].Latitude);
            }
          }
        }
      });
  },

  full: function(dirSource, dirResult, coords) {
    var pathToFiles = fileList(dirSource);
    var flag = 0;
    togeoc(pathToFiles[flag]);
    var qlc = {};

    function togeoc(pathTofile) {
      var forward = {
        "options": {
          "debug": true,
          "proximity": null
        },
        "pass": "0/"
      };
      var reverse = {
        "pass": "0/"
      };
      var counterflag = 1;
      var body = '';
      var rows = [];
      var stream = fs.createReadStream(pathTofile);
      csv.fromStream(stream, {
          headers: true
        })
        .on("data", function(data) {
          rows.push(data);
        })
        .on("end", function() {
          rows.sort(function(a, b) {
            return a.Importance - b.Importance;
          }).reverse();
          for (var i = 0; i < rows.length; i++) {
            if (i < numRowsAllowed) {
              if (rows[i].EnglishNameTranslation) {
                body += rows[i].EnglishNameTranslation + ',' + rows[i].Longitude + ',' + rows[i].Latitude + '\n';
              } else {
                body += rows[i].LocalName + ',' + rows[i].Longitude + ',' + rows[i].Latitude + '\n';
              }
              counterflag = i + 1;
            }
          }
          fs.writeFile(path.join(dirResult, path.basename(pathTofile)), body, function(err) {
            if (err) return console.log(err);
            flag++;
            if (flag < pathToFiles.length) {
              togeoc(pathToFiles[flag]);
              //build json file
              forward.options.proximity = coords.split(',').map(Number);
              forward.pass += counterflag;
              reverse.pass += counterflag;
              qlc[path.basename(pathTofile).split('.')[0] + '.forward'] = forward;
              qlc[path.basename(pathTofile).split('.')[0] + '.reverse'] = reverse;
            } else {
              console.log(JSON.stringify(qlc));
            }
          });

        });
    }
  }
};

function fileList(dir) {
  return fs.readdirSync(dir).reduce(function(list, file) {
    var name = path.join(dir, file);
    var isDir = fs.statSync(name).isDirectory();
    return list.concat(isDir ? fileList(name) : [name]);
  }, []);
}