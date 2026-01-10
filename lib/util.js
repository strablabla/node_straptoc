/*

Utilities

*/

var fs = require('fs');
var yaml = require('js-yaml');

function make_date(depth){

      /*

      Build the text date,
      year, month, day, hour, minute, sec
      depth = 6 --> goes to the seconds..

      */

      var date = new Date()
      var sec = date.getSeconds();
      var minute = date.getMinutes();
      var hour = date.getHours();
      var day = date.getDate();
      var month = date.getMonth()+1;
      var year = date.getFullYear();
      var txt_date = [year, month, day, hour, minute, sec]
      txt_date = txt_date.slice(0,depth).join('_')

      return txt_date

}

exports.save_current_version = function(data, with_date, name){

      /*

      Save the current file name.html
      in views/saved

      */
      fs.readFile('static/config.yaml', 'utf8', function (err, text) {
          if (err) { return console.log(err); }
          try {
            const config = yaml.load(text);
            const root = config.addr_saved || 'views/saved/';
            var basename = root.trim() + name + '_old'
          txt_date = make_date(4)  // 4 --> hour, 6 --> sec
          if ( with_date ){             // case where it is saved with a date..
              //console.log('txt_date ' + txt_date)
              var namefile = basename + '_' + txt_date + ".html"
              list_saved.push(txt_date)
              // console.log('list_saved.length ' + list_saved.length)
              // console.log('lim_nb_saved ' + lim_nb_saved)
              // console.log(list_saved)
              while (list_saved.length > lim_nb_saved){
                  //console.log('removing the oldest element ' + list_saved[0] + '!!!')
                  var addr_removed = basename + '_' + list_saved[0] + '.html'
                  try{
                      fs.unlinkSync(addr_removed)
                      console.log('addr_removed is ' + addr_removed)
                  }
                  catch(err){
                      console.log('cannot erase ' + addr_removed)
                  }
                  var index = list_saved.indexOf(list_saved[0]);
                  // console.log('index is ' + index)
                  // console.log('list_saved.length ' + list_saved.length)
                  if (index > -1) {
                    list_saved.splice(index, 1);
                    //console.log('list_saved in while ' + list_saved)
                  }
                  //console.log('list_saved  ' + list_saved)
              }
              //console.log('list_saved  ' + list_saved)
          }
          else{ var namefile = basename + ".html" }
          fs.writeFile( namefile, data, function(err) {
                if(err) { return console.log(err); }
                console.log("The file was saved as {} !".format(namefile));
          });    // end writeFile
          } catch(e) {
            console.error("Erreur lors du chargement de addr_saved:", e);
          }
      })
}           // end save_current_version


// Track last save time for each file (global)
if (!global.last_save_times) {
    global.last_save_times = {};
}

function save_conditions(md_file, intervalMinutes){
  // New system: check if enough time has elapsed since last save
  // Returns true if intervalMinutes have passed since last save

  var now = Date.now();
  var lastSaveTime = global.last_save_times[md_file] || 0;
  var elapsedMs = now - lastSaveTime;
  var elapsedMinutes = elapsedMs / (1000 * 60);
  var intervalMs = intervalMinutes * 60 * 1000;

  // Should save if enough time has elapsed
  var shouldSave = (elapsedMs >= intervalMs);

  // Also get current clock time for logging
  var date = new Date();
  var currentMinutes = date.getMinutes();
  var currentSeconds = date.getSeconds();
  var timeString = date.getHours() + ':' +
                   (currentMinutes < 10 ? '0' : '') + currentMinutes + ':' +
                   (currentSeconds < 10 ? '0' : '') + currentSeconds;

  return {
    shouldSave: shouldSave,
    elapsedMinutes: elapsedMinutes.toFixed(2),
    intervalMinutes: intervalMinutes,
    timeString: timeString,
    lastSaveTime: lastSaveTime
  };
}

function save_regularly(name){

      /*

      Saving regularly views/saved/ + name + .html

      */

      list_saved = []         // global
      lim_nb_saved = 3        // max versions saved

      // Read autosave interval from config.yaml (default: 15 minutes)
      var min_interv = 15;
      console.log('========================================');
      console.log('[AUTOSAVE] Initializing save_regularly for page:', name);
      console.log('[AUTOSAVE] Reading config from static/config.yaml...');
      try {
          const configText = fs.readFileSync('static/config.yaml', 'utf8');
          const config = yaml.load(configText);
          min_interv = config.autosave_interval || 15;
          console.log('[AUTOSAVE] Config loaded successfully');
          console.log('[AUTOSAVE] autosave_interval from config:', config.autosave_interval);
          console.log('[AUTOSAVE] Using interval:', min_interv, 'minutes');
      } catch(e) {
          console.log('[AUTOSAVE] ERROR reading config.yaml:', e.message);
          console.log('[AUTOSAVE] Using default interval: 15 minutes');
      }

      console.log('reading before saving in utils.js.. ')
      console.log('name is ' + name)

      var addr = 'views/md/' + name + '.html'
      console.log('addr is ' + addr)

      var intervalMs = parseInt(min_interv*60*1000);
      console.log('[AUTOSAVE] setInterval created with', intervalMs, 'milliseconds (' + min_interv + ' minutes)');
      console.log('[AUTOSAVE] Timer will fire every', (intervalMs/1000), 'seconds');
      console.log('========================================');

      var intervalCount = 0; // Track how many times the interval has fired

      // Initialize last save time to now (prevents immediate save on startup)
      if (!global.last_save_times[name]) {
          global.last_save_times[name] = Date.now();
          console.log('[AUTOSAVE] Initialized last_save_time for', name);
      }

      setInterval(function() {

          intervalCount++;
          console.log('========================================');
          console.log('[AUTOSAVE] Timer fired! Count:', intervalCount);
          console.log('[AUTOSAVE] Checking save conditions for page:', name);
          console.log('[AUTOSAVE] Current time:', new Date().toISOString());

          var conditions = save_conditions(name, min_interv);
          console.log('[AUTOSAVE] save_conditions returned:');
          console.log('[AUTOSAVE]   shouldSave:', conditions.shouldSave);
          console.log('[AUTOSAVE]   elapsed minutes:', conditions.elapsedMinutes);
          console.log('[AUTOSAVE]   interval minutes:', conditions.intervalMinutes);
          console.log('[AUTOSAVE]   clock time:', conditions.timeString);
          console.log('[AUTOSAVE]   last save timestamp:', new Date(conditions.lastSaveTime).toISOString());

          if (conditions.shouldSave){
                     console.log('[AUTOSAVE] ✓ Conditions MET - Proceeding with save');
                     console.log('[AUTOSAVE] Elapsed time (' + conditions.elapsedMinutes + ' min) >= Interval (' + conditions.intervalMinutes + ' min)');

                     fs.readFile(addr, 'utf8', function (err,data) {
                          if (err) {
                              console.log('[AUTOSAVE] ERROR reading file:', err);
                              return console.log(err);
                          }
                          console.log('[AUTOSAVE] File read successfully, length:', data.length);
                          console.log(make_date(4)) // 4 --> hour, 6 --> sec
                          console.log('inside setInterval, name.. is ' + name)
                          console.log('[AUTOSAVE] Calling save_current_version...');
                          exports.save_current_version(data, true, name) // with date

                          // Update last save time AFTER successful save
                          global.last_save_times[name] = Date.now();
                          console.log('[AUTOSAVE] ✓ Save completed successfully');
                          console.log('[AUTOSAVE] Updated last_save_time for', name);
                      });   // end fs.readFile

              } else {
                  console.log('[AUTOSAVE] ✗ Conditions NOT MET - Skipping save');
                  console.log('[AUTOSAVE] Elapsed: ' + conditions.elapsedMinutes + ' min < Required: ' + conditions.intervalMinutes + ' min');
                  console.log('[AUTOSAVE] Time remaining: ' + (conditions.intervalMinutes - parseFloat(conditions.elapsedMinutes)).toFixed(2) + ' min');
              }
              console.log('========================================');
        }, intervalMs); // 300000 5 min  //10000 10 sec //600000 10 min

}

exports.save_regularly_all = function(){

    /*

    Saving regularly markdown files..

    */

    console.log('========================================');
    console.log('[AUTOSAVE] save_regularly_all() called');
    console.log('[AUTOSAVE] Checking for global.list_md...');
    console.log('[AUTOSAVE] global.list_md:', global.list_md);
    console.log('========================================');

    try{
        // Use global.list_md instead of just list_md
        var list_md = global.list_md || [];
        console.log('[AUTOSAVE] list_md to process:', list_md);
        console.log('[AUTOSAVE] Number of md files:', list_md.length);

        for (md_file of list_md){
            console.log('[AUTOSAVE] Setting up autosave for:', md_file);
            save_regularly (md_file)
        }

        console.log('[AUTOSAVE] All autosave timers set up successfully');
        console.log('========================================');
    }catch(err){
        console.log('[AUTOSAVE] ERROR in save_regularly_all:', err.message)
        console.log('[AUTOSAVE] Stack trace:', err.stack)
        console.log('========================================');
    }

}
