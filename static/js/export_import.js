/*

Export / Import notes as zip

*/

var fs = require('fs')
var path = require('path')
var AdmZip = require('adm-zip')

// Data files to include in export
var DATA_FILES = [
    'static/config.yaml',
    'static/agenda.yaml',
    'static/tables.yaml',
    'static/annotations.yaml',
    'static/pages.json',
    'static/latex_voc.json',
    'static/drawing_state.json',
    'static/addr_saved.json'
]

// Markdown files directory
var MD_DIR = 'views/md'

function buildExportZip(){
    var zip = new AdmZip()

    // add markdown files
    if (fs.existsSync(MD_DIR)){
        var files = fs.readdirSync(MD_DIR)
        files.forEach(function(f){
            if (f.endsWith('_md.html')){
                var full = path.join(MD_DIR, f)
                zip.addLocalFile(full, 'views/md/')
            }
        })
    }

    // add data files
    DATA_FILES.forEach(function(f){
        if (fs.existsSync(f)){
            zip.addLocalFile(f, path.dirname(f))
        }
    })

    return zip.toBuffer()
}

function importFromBuffer(buffer){
    var zip = new AdmZip(buffer)
    var entries = zip.getEntries()
    var imported = []
    entries.forEach(function(entry){
        if (entry.isDirectory) return
        var entryPath = entry.entryName
        // only allow files in views/md/ or static/
        if (entryPath.startsWith('views/md/') || entryPath.startsWith('static/')){
            var targetDir = path.dirname(entryPath)
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
            fs.writeFileSync(entryPath, entry.getData())
            imported.push(entryPath)
        }
    })
    return imported
}

exports.setupRoutes = function(app){

    // Export: download zip
    app.get('/export-notes', function(req, res){
        try {
            var buffer = buildExportZip()
            var date = new Date().toISOString().slice(0,10)
            res.setHeader('Content-Type', 'application/zip')
            res.setHeader('Content-Disposition', 'attachment; filename="straptoc-export-' + date + '.zip"')
            res.send(buffer)
        } catch(e){
            console.error('Export error:', e)
            res.status(500).send('Export failed: ' + e.message)
        }
    })
}

exports.handleSocket = function(socket){

    // Import via socket (base64 zip)
    socket.on('import_notes', function(msg){
        try {
            var data = JSON.parse(msg)
            var buffer = Buffer.from(data.zip, 'base64')
            var imported = importFromBuffer(buffer)
            socket.emit('import_done', JSON.stringify({ success: true, files: imported }))
            console.log('Import successful:', imported.length, 'files')
        } catch(e){
            console.error('Import error:', e)
            socket.emit('import_done', JSON.stringify({ success: false, error: e.message }))
        }
    })
}
