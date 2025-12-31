/*

Agenda

*/

var fs = require('fs')
var yaml = require('js-yaml')

exports.handle = function(socket){

    socket.on('ask_agenda', function(dateKey){
        // dateKey format: "2025_12_31"
        fs.readFile('static/agenda.yaml', 'utf8', function (err, data) {
            if (err) {
                // File doesn't exist yet, return empty array
                socket.emit('day_notes', JSON.stringify([]))
                return
            }
            try {
                var agenda = yaml.load(data) || {}
                var notes = agenda[dateKey] || []
                socket.emit('day_notes', JSON.stringify(notes))
            } catch(e) {
                console.log('Error loading agenda:', e)
                socket.emit('day_notes', JSON.stringify([]))
            }
        })
    })

    socket.on('save_note', function(data){
        // data format: { dateKey: "2025_12_31", note: "text of note" }
        var noteData = JSON.parse(data)
        var dateKey = noteData.dateKey
        var noteText = noteData.note

        fs.readFile('static/agenda.yaml', 'utf8', function (err, yamlData) {
            var agenda = {}

            if (!err && yamlData) {
                try {
                    agenda = yaml.load(yamlData) || {}
                } catch(e) {
                    console.log('Error parsing agenda.yaml:', e)
                    agenda = {}
                }
            }

            // Initialize array for this date if it doesn't exist
            if (!agenda[dateKey]) {
                agenda[dateKey] = []
            }

            // Add new note with timestamp
            var timestamp = new Date().toISOString()
            agenda[dateKey].push({
                timestamp: timestamp,
                text: noteText
            })

            // Save back to YAML
            var yamlString = yaml.dump(agenda)
            fs.writeFile("static/agenda.yaml", yamlString, function(err) {
                if(err) {
                    console.log('Error saving agenda:', err)
                    return
                }
                console.log('saved agenda note')
                // Send back updated notes for this day
                socket.emit('day_notes', JSON.stringify(agenda[dateKey]))
            })
        })
    })

}
