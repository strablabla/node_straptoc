/*

Make vtt subtitles..

*/


var fs = require('fs');
var yaml = require('js-yaml');
var srt2vtt = require('srt2vtt');

exports.make_sub = function(){


      fs.readFile('static/config.yaml', 'utf8', function (err,text) {
            if (err) { return console.log(err); }
            try {
              const config = yaml.load(text);
              var root = config.subtitles_path;
              console.log('#### root for subtit is ' + root)

              fs.readdir(root, (err, files) => {
                  if (err) { return console.log(err); }
                  files.forEach(file => {
                     if (file.search('.srt') != -1){
                       var file_vtt = root + '/' + file.split('.srt')[0] + '.vtt'
                       console.log('file_vtt is ' + file_vtt)
                       if (! fs.existsSync(file_vtt)){
                          var srtData = fs.readFileSync(root + '/' + file);
                          console.log('Read srt file ')
                          srt2vtt(srtData, function(err, vttData) {
                            if (err) throw new Error(err);
                            fs.writeFileSync(file_vtt, vttData);
                            console.log('created the vtt file.. ')
                          });

                       }

                     }
                     else{
                       console.log('not a srt file')
                     }
                });
          }); // end fs.readdir
        } catch(err){
            console.log('Erreur lors du chargement des subtitles:', err)
        }
    }); // end fs.readFile

}
