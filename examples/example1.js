var GistDB = require('gistdb');

var gdb = new GistDB('USERNAME','PASSWORD');

var content = {example:'This is an example database!'};

gdb.create(content);

gdb.on('created',function (data) {
    console.log('Database created!');
    console.log(data);
    this.load(this.gistid);
});

gdb.on('loaded',function (data) {
    var date = new Date().getTime();
    console.log('Current data: '+data);
    console.log('Setting: test = '+date);
    this.set('test',date);
    console.log('Get "test": '+this.get('test'));
    this.save();
});

gdb.on('saved',function (data) {
    console.log('New data: '+data);
});

gdb.on('error',function (data) {
    console.log(data);
});
