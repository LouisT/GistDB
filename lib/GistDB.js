(function(){
   var http_get = require('./http_get.js'),
       util = require('util'),
       events = require('events');

   GistDB = function (opts) {
       if (!opts) {
          opts = {};
       }
       events.EventEmitter.call(this);
       this.api_url = 'https://api.github.com';
       this.user = opts.user||null;
       this.pass = opts.pass||null;
       this.gistid = opts.id||null;
       this.content = {};
       this.opts = (this.user&&this.pass?{username:this.user,password:this.pass}:{});
       this.opts.type = 'json';
       this.opts.timeout = opts.timeout||10000;
   };

   util.inherits(GistDB,events.EventEmitter);

   GistDB.prototype.emitter = function (listener,obj) {
       if (this.listeners(listener).length > 0) {
          this.emit(listener,obj);
        } else {
          console.log("ERROR: Missing event listener(s) for '"+listener+"'.");
          return false;
       }
   };

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
          this.emitter('error',{msg:'You must supply an ID.',id:1});
          return;
       }
       id = (id?id:this.gistid);
       this.gistid = id;
       this.opts.method = 'GET';
       http_get(this.api_url+'/gists/'+id,this.opts,function (data,err) {
             if (!err) {
                if (data.message) {
                   this.emitter('error',{msg:data['message'],id:1});
                   return;
                }
                this.db = this.getDBName(data.files); 
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.content = JSON.parse(data.files[this.db].content);
                      this.emitter('loaded',{content:data.files[this.db].content,id:data.id});
                    } else {
                      this.emitter('error',{msg:'No content in database.',id:1});
                   }
                 } else {
                   this.emitter('error',{msg:'Could not find a database.',id:1});
                }
              } else {
                this.emitter('error',{msg:data,id:1});
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
                   this.emitter('error',{msg:data['message'],id:2});
                   return;
                }
                this.db = this.getDBName(data.files);
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.contect = JSON.parse(data.files[this.db].content);
                      this.emitter('saved',{content:data.files[this.db].content,id:data.id});
                    } else {
                      this.emitter('error',{msg:'No content in database.',id:2});
                   }
                 } else {
                   this.emitter('error',{msg:'No such database.',id:2});
                }
              } else {
                this.emitter('error',{msg:data,id:2});
             }
          }.bind(this));
        } else {
          this.emitter('error',{msg:'No gistid or database name set.',id:2});
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
                   this.emitter('error',{msg:data['message'],id:3});
                   return;
                }
                this.db = (db?db:this.getDBName(data.files));
                if (data.files[this.db]) {
                   if (data.files[this.db].content) {
                      this.gistid = data.id;
                      this.content = JSON.parse(data.files[this.db].content);
                      this.emitter('created',{db:this['db'],id:data['id']});
                    } else {
                      this.emitter('error',{msg:'No content in database.',id:3});
                   }
                 } else {
                   this.emitter('error',{msg:'No such database.',id:3});
                }
              } else {
                this.emitter('error',{msg:data,id:3});
             }
          }.bind(this));
   };

   GistDB.prototype.set = function (name,data) {
       this.content[name] = data;
   }

   GistDB.prototype.get = function (name) {
       return this.content[name]||false;
   }

   GistDB.prototype.remove = function(name) {
       if (this.content.hasOwnProperty(name)) {
          delete this.content[name];
          return (!this.content.hasOwnProperty(name)?true:false);
        } else {
          return false;
       }
   }

   module.exports = GistDB;
}).call(this);
