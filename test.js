/*
  Test 2, read example database.
*/
console.log("Test 1: print from an example database.\n");
var GistDB = require('./');
var gdb = new GistDB({id:'9879133ed9dd415d7199'});
gdb.load();
gdb.on('loaded',function (data) {
    if (this.content.Example0 == "3100.205226801336") {
       console.log('Sucessful load.');
     } else {
       console.log('Example0 failed.');
    }
    console.log('Current data: '+JSON.stringify(this.content));
});


/*
  Test 2, no error handler.
*/
console.log("\n\nTest 2: No error handler.\n");
var gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:'9879133ed9dd415d7199',timeout:5000});
gdb.load();
gdb.on('loaded',function (data) {
    console.log('Current data: '+JSON.stringify(data));
});