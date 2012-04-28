(function(){
   var http_get = require('./http_get.js'),
       util = require('util'),
       events = require('events');

   GistDB = function (user,pass,id) {
       events.EventEmitter.call(this);
       this.api_url = 'https://api.github.com';
       this.user = user||null;
       this.pass = pass||null;
       this.gistid = id||null;
       this.content = {};
       this.opts = (this.user&&this.pass?{username:this.user,password:this.pass}:{});
       this.opts.type = 'json';
   };

   util.inherits(GistDB,events.EventEmitter);

   GistDB.prototype.getDBName = function (obj) {
       var first;
       for (var i in obj) {
           if (obj.hasOwnProperty(i) && typeof(first) !== 'function') {
              first = obj[i]; break;
           }
       }
       return (first.filename?first.filename:false);
   };

   GistDB.prototype.load = function (id) {
       if (!id && !this.gistid) {
          this.emit('error',{msg:'You must supply an ID.',id:1});
          return;
       }
       id = (id?id:this.gistid);
       this.opts.method = 'GET';
       http_get(this.api_url+'/gists/'+id,this.opts,function (data,err) {
             if (!err) {
                if (data.message) {
                   this.emit('error',{msg:data['message'],id:5});
                   return;
                }
                this.db = this.getDBName(data.files); 
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.content = JSON.parse(data.files[this.db].content);
                      this.emit('loaded',{content:data.files[this.db].content,id:data.id});
                    } else {
                      this.emit('error',{msg:'No content in database.',id:3});
                   }
                 } else {
                   this.emit('error',{msg:'Could not find a database.',id:2});
                }
              } else {
                this.emit('error',{msg:err,id:0});
            }
       }.bind(this));
   };

   GistDB.prototype.save = function () {
       if (this.gistid) {
          this.opts.method = 'PUT';
          var data = this.content||{},
              GIST = {description:'GistDB Database',files:{}};
          GIST['files'][this.db] = {content:JSON.stringify(data)};
          this.opts.postData = JSON.stringify(GIST);
          http_get(this.api_url+'/gists/'+this.gistid,this.opts,function (data,err) {
             if (!err) {
                if (data.message) {
                   this.emit('error',{msg:data['message'],id:5});
                   return;
                }
                this.db = this.getDBName(data.files);
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.contect = JSON.parse(data.files[this.db].content);
                      this.emit('saved',{content:data.files[this.db].content,id:data.id});
                    } else {
                      this.emit('error',{msg:'No content in database.',id:5});
                   }
                 } else {
                   this.emit('error',{msg:'No such database.',id:2});
                }
              } else {
                this.emit('error',{msg:err,id:0});
             }
          }.bind(this));
        } else {
          this.emit('error',{msg:'No gistid or database name set.',id:4});
       }
   };

   GistDB.prototype.create = function (data,db,pub,desc) {
          var data = data||{},
              db = db||'undefined',
              pub = pub||false,
              desc = desc||'GistDB Database',
              GIST = {description:desc,files:{}};
          GIST['files'][db] = {content:JSON.stringify(data)};
          this.opts.postData = JSON.stringify(GIST);
          this.opts.method = "POST";
          http_get(this.api_url+'/gists',this.opts,function (data,err) {
             if (!err) {
                if (data.message) {
                   this.emit('error',{msg:data['message'],id:5});
                   return;
                }
                this.db = (db?db:this.getDBName(data.files));
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.content = JSON.parse(data.files[this.db].content);
                      this.emit('created',{db:this['db'],id:data['id']});
                    } else {
                      this.emit('error',{msg:'No content in database.',id:3});
                   }
                 } else {
                   this.emit('error',{msg:'No such database.',id:2});
                }
              } else {
                this.emit('error',{msg:err,id:0});
             }
          }.bind(this));
   };

   GistDB.prototype.set = function (name,data) {
       this.content[name] = data;
   }

   GistDB.prototype.get = function (name) {
       return this.content[name]||false;
   }

   module.exports = GistDB;
}).call(this);
