const fs = require('fs');
path = require('path');

exports.walkDir = function(dir, callback) {
  for ( f of fs.readdirSync(dir) ){
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?
      exports.walkDir(dirPath, callback) : callback(path.join(dir, f));
  };
};
