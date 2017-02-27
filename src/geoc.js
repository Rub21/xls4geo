var fs = require('fs');
var csv = require("fast-csv");
var path = require('path');
var numRows = 20;

module.exports = {
  build: function(file) {
    var counterflag = 1;
    var stream = fs.createReadStream(file);
    csv.fromStream(stream, {
        headers: true
      })
      .on("data", function(data) {
        if (numRows > counterflag) {
          console.log(data.LocalName + ',' + data.Longitude + ',' + data.Latitude);
        }
        counterflag++;
      })
      .on("end", function() {});
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
      var stream = fs.createReadStream(pathTofile);
      csv.fromStream(stream, {
          headers: true
        })
        .on("data", function(data) {
          if (numRows > counterflag) {
            body += data.LocalName + ',' + data.Longitude + ',' + data.Latitude + '\n';
          } else {
            return;
          }
          counterflag++;
        })
        .on("end", function() {
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
              // console.log('check your files : ' + dirResult);
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
