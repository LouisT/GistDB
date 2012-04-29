/*
  This example is missing a listener for error.
  A message will be displayed alerting you of this.
  Look at example 4 on how to fix this.
*/

var GistDB = require('../index.js');
var gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:'9879133ed9dd415d7199',timeout:5000});
gdb.load();
gdb.on('loaded',function (data) {
    console.log('Current data: '+JSON.stringify(data));
});
