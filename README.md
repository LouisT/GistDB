GistDB
======

Install:
    npm install gistdb

This project was started just to learn the gist api.

This project is [Unlicensed](http://unlicense.org/ "Title")

Functions
------
    create(content[,database name]); -- Create a new databse. (Requires auth) - Caller ID: 3
    get(key) -- Get the value for key.
    load([gist id]); -- Load a database. (No auth required) - Caller ID: 1
    remove(key) -- Deletes a key and its value. Returns true or false.
    save(); -- Saves a database to gist. (Requires auth) - Caller ID: 2
    set(key,value); -- Sets a key with said value.
 
    NOTE: Caller ID is used for the error lisener.

Listeners
------
    created -- Triggered by create()
        Returned in object: db (database name), id (gist id)
        Example: GistDB.on('created',function(obj) { console.log("Database: "+obj.db+" - ID: "+obj.id); });
    loaded -- Triggered by load();
        Returned in object: content (database), id (gist id)
        Example: GistDB.on('loaded',function(obj) { console.log("Content: "+JSON.stringify(obj.content)); });
    saved -- Triggered by save();
        Returned in object: content (database), id (gist id)
        Example: GistDB.on('saved',function(obj) { console.log("Content: "+JSON.stringify(obj.content)); });
    error -- Triggered by create(), load(), save()
        Returned in object: msg (error message), id (function caller id)
        Example: GistDB.on('error',function(obj) { console.log("Error Message: "+obj.msg+" - Caller ID: "+obj.id); });

    NOTE: If a listener is called without being defined, a message is sent to console.

Options
------
    NOTE: Username and password are not needed if you're only going to load the gist.
          Changed from "user,pass,[opts]" for easy option choosing.

    User - Your github user name. (optional only if loading a gist.)
    Pass - Your github password. (optional only if loading a gist, required with username.)
    ID - Your gist id. (optional)
    Timeout - Request timeout. (optional, defaults to 10 seconds)
        Example: gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:"9cb6f8b7baa8300af0d7",timeout:1000});

Usage
-------
    var GistDB = require('gistdb');
    var gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:"9cb6f8b7baa8300af0d7",timeout:1000});

Example
-------
    var GistDB = require('gistdb');
    var gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:"9cb6f8b7baa8300af0d7",timeout:1000});
    var content = {example:'This is an example database!'};
    gdb.create(content,'example.db');
    gdb.on('created',function (data) {
        console.log('New database created! ('+data.id+')');
        init(gdb);
    });
    gdb.on('error',function (data) {
        console.log('There was an error! (Error: '+data.msg+')');
    });
    
    gdb.on('saved',function (data) {
        console.log('Content saved to database!');
    });
    
    console.log('Init called: '+gdb.get('Initcalled')); // will return false, as the DB isn't loaded.
    
    function init (gdb) {
             gdb.set('Initcalled',true);
             console.log('Init called: '+gdb.get('Initcalled')); // SHOULD return true if you loaded the DB correctly.
             this.save(); // Save when ever you feel like it. (probably best after adding content to the object.)
             // Run your project...
    };
