(function(){ 
   http_get = function (url, options, cb) {
            var opts = {}, p;
            if (!cb) {
               cb = options;
               options = {};
            }
            if (typeof(url) === 'string') {
               opts = require('url').parse(url);
             } else {
               opts = url;
               url = opts.herf;
            }
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                   opts[i] = options[i];
                }
            }
            opts.headers = opts.headers||{};
            if ((p = get_proto()) === null) {
               cb('unsupported protocol',1,null);
               return;
            }
            if (opts.username && opts.password) {
               opts.auth = opts.username+":"+opts.password;
            }
            if (opts.type) {
               opts.type = opts.type.toLowerCase();
               if (opts.type == 'head') {
                  opts.method = 'HEAD';
               }
             } else {
               opts.type = 'default';
            }
            if (!opts.method) {
               opts.method = (opts.postData?"POST":"GET");
            }
            if (opts.method == 'POST' || opts.method == 'PUT') {
               opts.headers["Content-type"] = "application/x-www-form-urlencoded";
               opts.headers["Content-length"] = opts.postData.length;
            }
            var body = "";
            var req = p.request(opts, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    body += chunk;
                }).on('end', function() {
                    if (this.timeout) { 
                       clearTimeout(this.timeout);
                    }
                    if (opts.type) {
                       if (opts.type != 'default') {
                          var parsed = returnType(opts.type, body, res);
                          return cb((parsed?parsed:"Could not parse content."),!parsed,res);
                       }
                    }
                    cb(body,null,res);
                }.bind(this));
            });
            if (opts.timeout) {
               req.timeout = setTimeout(function(){
                    this.abort();
                    this.emit('error',{message:'request reached timeout'});
               }.bind(req),(!isNaN(opts.timeout)?opts.timeout:30000));
            }
            req.on('error', function(e) {
               if (this.timeout) {
                  clearTimeout(this.timeout);
               }
               if (!this.haderr) {
                  cb(e.message,1,null);
               }
               this.haderr = true;
            });
            if (opts.postData) {
               req.write(opts.postData);
            }
            req.end();
            function returnType (type, body, res) {
                     switch (type) {
                            case 'head':
                                 return res.headers||{};
                            case 'json':
                                 try {
                                    return JSON.parse(body);
                                  } catch (e) {
                                    return false;
                                 }
                            case 'xml':
                                 try {
                                    var parser = require('xml2json');
                                    return JSON.parse(parser.toJson(body));
                                  } catch (e) {
                                    return false;
                                 }
                            default:
                                 return body;
                     }
            }
            function get_proto() {
                     var s = opts.protocol.slice(0, -1).toLowerCase();
                     switch (s) {
                            case 'http':
                            case 'https':
                                 return require(s);
                            default:
                                 return null;
                     }
            }
   }
   http_get.querystring = function(opts) {
            return require('querystring').stringify(opts);
   }
   http_get.applyQuerystring = function(url, opts) {
            var qs = require("querystring"),
                ourl = require('url');
                uo = ourl.parse(url)
            us = qs.parse(uo.query||{});
            for (var i in opts) {
                if (opts.hasOwnProperty(i)) {
                   us[i] = opts[i]
                }
            }
            uo.query = qs.stringify(us);
            uo.search = "?"+uo.query
            return ourl.format(uo);
   }
   module.exports = http_get;
}).call(this);