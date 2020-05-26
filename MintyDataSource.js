const config = require('./MintyConfig');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database/MintyHydro.db');

const DB_COMMAND = 'DB:COMMAND';
const DB_RESULT = 'DB:RESULT';
const DB_JSON = 'DB:JSON';

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
        this.socket.on(DB_COMMAND, function (opts) {
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
                case 'ALL' :
                    this.all(opts);
                    break;
                case 'DELETE' :
                    this.delete(opts);
                case 'JSON:GET' :
                    this.getJSON(opts);
                    break;
                case 'JSON:SET' :
                    this.setJSON(opts);
                    break;
                case 'JSON:ALL' :
                    this.allJSON(opts);
                    break;
                case 'SAVE:EVENT' :
                    this.saveEvent(opts);
                    break;
                case 'SPARKLINE' :
                    this.getSparklineData(opts);
                    break;
            }
        }.bind(this));
    },

    getSparklineData: function(opts, callback) {
        let sql = "SELECT sensor, value FROM MH_READING" + 
                  " WHERE strftime('%Y-%m-%d %H:%M:%S', datesetup)" + 
                  " >= strftime('%Y-%m-%d %H:%M:%S', datetime('now', '-30 minute', 'localtime'))" + 
                  " AND sensor = '" + opts.sensor + "'";
        db.serialize(function() {
            db.all(sql, function(err, rows) {
                if (err == null) {
                    opts.rows = rows;
                    this.io.socketEmit(DB_RESULT, opts);
                    if (callback) callback(rows);
                }
            }.bind(this));
        }.bind(this));  
    },

    getActiveControlStates: function(callback) {
        let sql = "SELECT name, value FROM MH_CONTROL";
        db.serialize(function() {
            db.all(sql, function(err, rows) {
                if (err == null) {
                    if (callback) callback(rows);
                }
            }.bind(this));
        }.bind(this));  
    },
  
    getActiveSchedules: function(callback) {
        let sql = "SELECT E.resource, E.trigger, E.condition, C.value" + 
                  " FROM MH_EVENT E, MH_CONTROL C" +
                  " WHERE (strftime('%Y-%m-%d %H:%M:%S', E.start_date)" + 
                  " <= strftime('%Y-%m-%d %H:%M:%S', datetime('now','localtime'))" + 
                  " AND strftime('%Y-%m-%d %H:%M:%S', e.end_date) " + 
                  " >= strftime('%Y-%m-%d %H:%M:%S', datetime('now','localtime'))) " + 
                  " AND E.resource||'STATE' = C.name " + 
                  " AND C.value = 'AUTO' " + 
                  " ORDER BY E.resource, E.condition ";
        log("sql",sql);
        db.serialize(function() {
            db.all(sql, function(err, rows) {
                if (err == null) {
                    if (callback) callback(rows);
                }
            }.bind(this));
        }.bind(this));  
    },


    insert: function(opts, callback) {
        opts.command = 'INSERT';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_" + opts.table + " VALUES (?,?,datetime('now', 'localtime'))");
            stmt.run(opts.name, opts.value, function(err, row) {
            }.bind(this));
            stmt.finalize();
            if (callback) callback(opts);
        }.bind(this));
    },

    getJSON : function(opts, callback) {
        opts.command = 'JSON:GET';
        db.serialize(function() {
            db.get("SELECT value FROM MH_" + opts.table + " WHERE name = " + opts.name, function(err, row) {
                if (err == null) {
                    opts.json = row.value;
                    this.io.socketEmit(DB_JSON, opts);
                    if (callback) callback(opts);
                }
            }.bind(this));
        }.bind(this));
    },

    allJSON : function(opts, callback) {
        opts.command = 'JSON:ALL';
        db.serialize(function() {
            db.all("SELECT value FROM MH_" + opts.table, function(err, rows) {
                if (err == null) {
                    opts.json = rows;
                    this.io.socketEmit(DB_JSON, opts);
                    if (callback) callback(opts);
                }
            }.bind(this));
        }.bind(this));
    },

    setJSON : function(opts, callback) {
        opts.command = 'JSON:SET';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_" + opts.table + " VALUES (?,?,datetime('now', 'localtime'))");
            stmt.run(opts.name, JSON.stringify(opts.json), function(err, row) {
                stmt.finalize();
                if (err == null) {
                    if (callback) callback(opts);
                } else {
                    db.serialize(function() {
                        stmt = db.prepare("UPDATE MH_" + opts.table + " SET value = ? WHERE name = ?");
                        stmt.run(JSON.stringify(opts.json), opts.name);
                        stmt.finalize();
                        if (callback) callback(opts);
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    },

    saveEvent : function(opts, callback) {
        let event = opts.event;
        opts.command = 'SAVE:EVENT';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_EVENT VALUES (?,?,?,?,?,?,?,?,?)");
            stmt.run(event.id, event.start_date, event.end_date,
                     event.desc,event.textColor, event.color, event.automation.resource, 
                     event.automation.trigger, event.automation.condition,  
                     function(err, row) {
                stmt.finalize();
                if (err == null) {
                    if (callback) callback(opts);
                } else {
                    db.serialize(function() {
                        let sql = "UPDATE MH_EVENT SET start_date = ?, end_date = ?,";
                        sql += " desc = ?, textColor = ?, color = ?, ";
                        sql += " resource = ?, trigger = ?, condition = ? ";
                        sql += " WHERE id = ?";
                        stmt = db.prepare(sql);
                        stmt.run(event.start_date, 
                                event.end_date,
                                event.desc, event.textColor, event.color,
                                event.automation.resource, 
                                event.automation.trigger,
                                event.automation.condition, 
                                event.id);
                        stmt.finalize();
                        if (callback) callback(opts);
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    },

    update : function(opts, callback) {
        opts.command = 'UPDATE';
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO MH_" + opts.table + " VALUES (?,?, datetime('now', 'localtime'))");
            stmt.run(opts.name, opts.value.toString(), function(err, row) {
                stmt.finalize();
                if (err == null) {
                    if (callback) callback(opts);
                } else {
                    db.serialize(function() {
                        stmt = db.prepare("UPDATE MH_" + opts.table + " SET value = ? WHERE name = ?");
                        stmt.run(opts.value.toString(), opts.name);
                        stmt.finalize();
                        if (callback) callback(opts);
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    },

    select : function(opts, callback) {
        opts.command = 'SELECT';
        db.serialize(function() {
            db.get("SELECT value FROM MH_" + opts.table + " WHERE name = " + opts.name, function(err, row) {
                opts.row = row;
                if (err == null) {
                    opts.value = row.value;
                    this.io.socketEmit(DB_RESULT, opts);
                    if (callback) callback(opts);
                }
            }.bind(this));
        }.bind(this));
    },

    all : function(opts, callback) {
        opts.command = 'ALL';
        db.serialize(function() {
            db.all("SELECT * FROM MH_" + opts.table, function(err, rows) {
                opts.rows = rows;
                if (err == null) {
                    this.io.socketEmit(DB_RESULT, opts);
                    if (callback) callback(opts);
                }
            }.bind(this));
        }.bind(this));
    },

    delete : function(opts, callback) {
        opts.command = 'DELETE';
        db.serialize(function() {
            db.get("DELETE FROM MH_" + opts.table + " WHERE name = '" + opts.name + "'", function(err, row) {
                if (callback) callback(opts);
            }.bind(this));
        }.bind(this));
    },

    createTables: function() {
        this.createControlsTable();
        this.createSensorTable();
        this.createSensorReadingTable();  
        this.createSettingTable();      
        this.createNutrientTable();      
        this.createSchedulerEventsTable();
    },

    createSchedulerEventsTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_EVENT (";
        sql += " id INTEGER PRIMARY KEY,";
        sql += " start_date datetime NOT NULL,";
        sql += " end_date datetime,";
        sql += " desc TEXT,";
        sql += " textColor TEXT,";
        sql += " color TEXT,";
        sql += " resource TEXT NOT NULL,";
        sql += " trigger TEXT NOT NULL,";
        sql += " condition TEXT";
        sql += ")";
        db.run(sql);
    },

    createControlsTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_CONTROL (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " value TEXT,";
        sql += " datesetup datetime";
        sql += ")";
        db.run(sql);
    },

    createSettingTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_SETTING (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " value TEXT,";
        sql += " datesetup datetime";
        sql += ")";
        db.run(sql);
    },

    createNutrientTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_NUTRIENT (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " value TEXT,";
        sql += " datesetup datetime";
        sql += ")";
        db.run(sql);
    },

    createSensorTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_SENSOR (";
        sql += " name TEXT PRIMARY KEY,";
        sql += " desc TEXT NOT NULL,";
        sql += " unit TEXT NOT NULL,";
        sql += " datesetup datetime"; 
        sql += ")";
        db.run(sql);
    },

    createSensorReadingTable() {
        var sql = "CREATE TABLE IF NOT EXISTS MH_READING (";
        sql += " sensor TEXT,";
        sql += " value TEXT, ";
        sql += " datesetup datetime";
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