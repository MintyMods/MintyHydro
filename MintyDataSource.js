const config = require('./MintyConfig');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database/MintyHydro.datasource');

const COMMAND = 'DB:COMMAND';
const RESULT = 'DB:RESULT';

const MintyDataSource = {
    io: null,
    socket: null,
    shutdown: false,
 
    initDatabase: function(mintyIO) {
        this.io = mintyIO;
        this.socket = mintyIO.getSocket();
        this.createTables();
        this.initEvents();
    },

    setIO: function (mintyIO) {
        this.io = mintyIO;
    },

    initEvents: function() {
        this.socket.on(COMMAND, function (opts) {
            switch (opts.command) {
                case 'INSERT' :
                    this.insert(opts);
                    break;
                case 'UPDATE' :
                    this.update(opts);
                    break;
                case 'SELECT' :
                    this.select(opts);
                    break;
                case 'SELECT_ALL' :
                    this.all(opts);
                    break;
                case 'DELETE' :
                    this.delete(opts);
                    break;
            }
        }.bind(this));
    },

    insert: function(opts) {
        opts.command = 'INSERT';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_" + opts.table + " VALUES (?,?,datetime('now'))");
            stmt.run(opts.name, opts.value, function(err, row) {
                // if (err == null) {
                //     this.io.socketEmit(RESULT, opts);
                // }
            }.bind(this));
            stmt.finalize();
        }.bind(this));
    },

    update : function(opts) {
        opts.command = 'UPDATE';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_" + opts.table + " VALUES (?,?,datetime('now'))");
            stmt.run(opts.name, opts.value, function(err, row) {
                if (err == null) {
                    // opts.command = 'INSERT';
                    // this.io.socketEmit(RESULT, opts);
                } else {
                    db.serialize(function() {
                        stmt = db.prepare("UPDATE MH_" + opts.table + " SET value = ? WHERE name = ?");
                        stmt.run(opts.name, opts.value);
                        stmt.finalize();
                        // opts.command = 'UPDATE';
                        // this.io.socketEmit(RESULT, opts);
                    }.bind(this));
                }
            }.bind(this));
            stmt.finalize();
        }.bind(this));
    },

    select : function(opts) {
        opts.command = 'SELECT_ONE';
        db.serialize(function() {
            db.get('SELECT value FROM MH_' + opts.table + ' WHERE name = ' + opts.name, function(err, row) {
                opts.row = row;
                if (err == null) {
                    opts.value = row.value;
                    this.io.socketEmit(RESULT, opts);
                }
            }.bind(this));
        }.bind(this));
    },

    all : function(opts) {
        opts.command = 'SELECT_ALL';
        db.serialize(function() {
            db.all('SELECT name, value FROM MH_' + opts.table, function(err, rows) {
                opts.rows = rows;
                if (err == null) {
                    this.io.socketEmit(RESULT, opts);
                }
            }.bind(this));
        }.bind(this));
    },

    delete : function(opts) {
        opts.command = 'DELETE';
        db.serialize(function() {
            db.get("DELETE FROM MH_" + opts.table + " WHERE name = '" + opts.name + "'", function(err, row) {
                // if (err == null) {
                //     this.io.socketEmit(RESULT, opts);
                // }
            }.bind(this));
        }.bind(this));
    },

    createTables: function() {
        this.createSensorTable();
        this.createSensorReadingTable();  
        this.createSettingsTable();      
    },

    createSettingsTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_SETTING (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " value TEXT,";
        sql += " datetime TEXT";
        sql += ")";
        db.run(sql);
    },

    createSensorTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_SENSOR (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " desc TEXT NOT NULL,";
        sql += " unit TEXT NOT NULL,";
        sql += " datetime TEXT";
        sql += ")";
        db.run(sql);
    },

    createSensorReadingTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_READING (";
        sql += " sensor TEXT,";
        sql += " value TEXT, ";
        sql += " datetime TEXT";
        sql += ")";
        db.run(sql);
    },

    shutDown: function() {
        try {
            db.close();
        } catch (e) {
            warn(e);
        }
    },
}

function warn(msg, payload) {
    console.warn("[" + (new Date()).toUTCString() + "]  ** ALERT ** [DATASOURCE] " + msg, payload != undefined ? payload : "");
}

function log(msg, payload) {
    if (config.debug) console.log("[" + (new Date()).toUTCString() + "]  [DATASOURCE] " + msg, payload != undefined ? payload : "");
}

module.exports = MintyDataSource;