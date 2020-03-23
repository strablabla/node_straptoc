/*

Make vtt subtitles..

*/


var fs = require('fs');
var srt2vtt = require('srt2vtt');

exports.make_sub = function(){
      var root = '../../../../../../media/sdata/Films/Very_Good'
      fs.readdir(root, (err, files) => {

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

  });


}
