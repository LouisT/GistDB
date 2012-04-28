GistDB
======

I will write a better readme later.

This project was started just to learn the gist api.

This project is [Unlicensed](http://unlicense.org/ "Title")

Commands
--------
I will make this better, for now look at the examples.

Options
------
    NOTE: Username and password are not needed if you're only going to load the gist.

    ID - Your gist id. (optional)
    Timeout - Request timeout. (optional, defaults to 10 seconds)
    Example: gdb = new GistDB('USERNAME','PASSWORD',{id:"9cb6f8b7baa8300af0d7",timeout:1000});

Usage
-------
    var GistDB = require('gistdb');
    var gdb = new GistDB('USERNAME','PASSWORD',{id:"9cb6f8b7baa8300af0d7",timeout:1000});
    gdb.create(object,'database.name');

Example
-------
    var GistDB = require('gistdb');
    var gdb = new GistDB('USERNAME','PASSWORD',{id:"9cb6f8b7baa8300af0d7",timeout:1000});
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
