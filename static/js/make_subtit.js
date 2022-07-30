/*

Make vtt subtitles..

*/


var fs = require('fs');
var srt2vtt = require('srt2vtt');

exports.make_sub = function(){


      fs.readFile('static/subtit.json', 'utf8', function (err,text) {
            if (err) { return console.log(err); }
            var root = text.trim()
            console.log('#### root for subtit is ' + root)
            //try{
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
      // }
      // catch(err){
      //     console.log('issue with subtitles')
      // }
    }); // end fs.readFile
}
