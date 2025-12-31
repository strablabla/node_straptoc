/*

Agenda

*/

var fs = require('fs')
var yaml = require('js-yaml')

exports.handle = function(socket){

    socket.on('ask_all_agenda', function(){
        // Send all agenda data to client for checking alerts
        fs.readFile('static/agenda.yaml', 'utf8', function (err, data) {
            if (err) {
                socket.emit('all_agenda_data', JSON.stringify({}))
                return
            }
            try {
                var agenda = yaml.load(data) || {}
                socket.emit('all_agenda_data', JSON.stringify(agenda))
            } catch(e) {
                console.log('Error loading agenda:', e)
                socket.emit('all_agenda_data', JSON.stringify({}))
            }
        })
    })

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

            // Check if text starts with a time (HH:MM or H:MM format)
            var timePattern = /^\d{1,2}:\d{2}/
            var isAlert = timePattern.test(noteText)

            // Add new note with timestamp
            var timestamp = new Date().toISOString()
            var noteObj = {
                timestamp: timestamp,
                text: noteText
            }

            if (isAlert) {
                noteObj.alert = true
            }

            agenda[dateKey].push(noteObj)

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

    socket.on('delete_note', function(data){
        // data format: { dateKey: "2025_12_31", timestamp: "ISO timestamp" }
        var deleteData = JSON.parse(data)
        var dateKey = deleteData.dateKey
        var timestamp = deleteData.timestamp

        fs.readFile('static/agenda.yaml', 'utf8', function (err, yamlData) {
            if (err) {
                console.log('Error reading agenda for deletion:', err)
                return
            }

            try {
                var agenda = yaml.load(yamlData) || {}

                if (agenda[dateKey]) {
                    // Filter out the note with matching timestamp
                    agenda[dateKey] = agenda[dateKey].filter(function(note) {
                        return note.timestamp !== timestamp
                    })

                    // If no notes left for this date, remove the date key
                    if (agenda[dateKey].length === 0) {
                        delete agenda[dateKey]
                    }
                }

                // Save back to YAML
                var yamlString = yaml.dump(agenda)
                fs.writeFile("static/agenda.yaml", yamlString, function(err) {
                    if(err) {
                        console.log('Error saving agenda after deletion:', err)
                        return
                    }
                    console.log('deleted agenda note')
                    // Send back updated notes for this day
                    var updatedNotes = agenda[dateKey] || []
                    socket.emit('day_notes', JSON.stringify(updatedNotes))
                })
            } catch(e) {
                console.log('Error parsing agenda for deletion:', e)
            }
        })
    })

}
