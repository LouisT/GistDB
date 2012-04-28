var GistDB = require('gistdb');

var gdb = new GistDB('USERNAME','PASSWORD');

var content = {example:'This is an example database!'};

gdb.create(content);

gdb.on('created',function (data) {
    console.log('Database created!');
    randomDataInsert(this);

});

gdb.on('saved',function (data) {
    console.log('Saved!');
    console.log('https://gist.github.com/'+data.id);
});

gdb.on('error',function (data) {
    console.log(data);
});

function randomDataInsert (gdb) {
         for (i = 0; i < 10; i++) {
             gdb.set('Example'+i,Math.random()*10000);
         }
         console.log('Random data added.');
         console.log('Content: '+JSON.stringify(gdb.content));
         console.log('Saving data in 5 seconds.');
         setTimeout(function(){
             console.log('Saving.');
             this.save();
         }.bind(gdb),5000);
}
