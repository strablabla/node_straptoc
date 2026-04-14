/*

Mini Tables - inline editable tables

*/

var fs = require('fs')
var yaml = require('js-yaml')

var TABLES_FILE = 'static/tables.yaml'

function loadTables(){
    try {
        var data = fs.readFileSync(TABLES_FILE, 'utf8')
        return yaml.load(data) || {}
    } catch(e) {
        return {}
    }
}

function saveTables(tables){
    var content = yaml.dump(tables, { indent: 2, lineWidth: -1, noRefs: true })
    fs.writeFileSync(TABLES_FILE, content)
}

exports.handle = function(socket){

    socket.on('get_table_data', function(tableId){
        var tables = loadTables()
        var data = tables[tableId] || null
        socket.emit('table_data_' + tableId, JSON.stringify(data))
    })

    socket.on('save_table_data', function(msg){
        var parsed = JSON.parse(msg)
        var tableId = parsed.id
        var data = parsed.data
        var tables = loadTables()
        tables[tableId] = data
        saveTables(tables)
        console.log('Table saved:', tableId)
    })
}
