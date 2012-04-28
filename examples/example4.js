var GistDB = require('./index.js');
var gdb = new GistDB('USER','PASSWORD',{id:'9879133ed9dd415d7199',timeout:5000});
gdb.load();
gdb.on('loaded',function (data) {
    console.log('Current data: '+JSON.stringify(data));
});
gdb.on('error',function (data) {
    console.log(data);
});

