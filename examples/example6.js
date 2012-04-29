/*
  Do nothing but load and output the database.
*/
var GistDB = require('../index.js');
var gdb = new GistDB({id:'9879133ed9dd415d7199'});
gdb.load();
gdb.on('loaded',function (data) {
    console.log('Current data: '+JSON.stringify(this.content));
});
