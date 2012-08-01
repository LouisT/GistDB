/*
  Yes, I realize these tests are super simple and need to be improved.

  Test 1, read example database.
*/
console.log("Test 1: print from an example database.");
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
    runTest2();
});
/*
  Test 2, no error handler.
*/
function runTest2 () {
         console.log("\nTest 2: No error handler.\n");
         var gdb = new GistDB({user:'USERNAME',pass:'PASSWORD',id:'9879133ed9dd415d7199',timeout:5000});
         gdb.load();
         gdb.on('loaded',function (data) {
             console.log('Current data: '+JSON.stringify(data));
         });
}
