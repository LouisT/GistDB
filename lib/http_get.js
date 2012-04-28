(function(){
   var crypto = 
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
            opts.method = (opts.postData?"POST":"GET");
            if (opts.method == 'POST' || opts.method == 'PUT') {
               opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
               opts.headers["Content-Length"] = opts.postData.length;
            }
            var body = "";
            var req = p.request(opts, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    body += chunk;
                }).on('end', function() {
                    if (opts.type) {
                       if (opts.type.toLowerCase() != 'auto') {
                          return cb(returnType(opts.type, body),null,res);
                       }
                    }
                    cb(body,null,res);
                });
            });
            req.on('error', function(e) {
                cb(e.message,null,null);
            });
            if (opts.postData) {
               req.write(opts.postData);
            }
            req.end();
            function returnType (type, body) {
                     switch (type.toLowerCase()) {
                            case 'jsdom':
                                 var jsdom = require("jsdom")
                                 var _jsdom = new jsdom.jsdom(body,null,{features:{QuerySelector: true}});
                                 return _jsdom.createWindow();
                            case 'json':
                                 return JSON.parse(body);
                            case 'xml':
                                 var parser = require('xml2json');
                                 return JSON.parse(parser.toJson(body));
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
