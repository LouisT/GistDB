/*!
 * Use `gist` as a key/value database. - https://ltdev.im/ - Copyright (c) 2017 Louis T.
 * Licensed under MIT license https://raw.githubusercontent.com/LouisT/GistDB/master/UNLICENSE
 */
const MapDSL = require('mapdsl/chainable');

class Collection extends MapDSL {
      constructor (_map) {
          super(_map);
      }

      /*
       * Convert `this` to JSON for saving to gist.
       * If `str` is true, stringify! (Default: true)
       */
      toJSON (options = {}) {
          let opts = Object.assign({
              stringify: true,
              promise: false,
              pretty: false,
          }, options);
          try {
              let obj = Object.create(null);
              for (let [key, val] of this) {
                  obj[key] = val;
              }
              return ((res) => {
                  return (opts.promise ? Promise.resolve(res) : res);
              })(opts.stringify ? JSON.stringify(obj, true, (opts.pretty ? 4 : 0)) : obj);
           } catch (error) {
             return (promise ? Promise.reject(error) : error);
          }
      }

      /*
       * Convert JSON and load to `this` object.
       * If `str` is true, parse! (Default: true)
       */
      fromJSON (json, options = {}) {
          let opts = Object.assign({
              parse: true,
              promise: true
          }, options);
          try {
              let obj = (opts.parse ? JSON.parse(json) : json);
              for (let key of Object.keys(obj)) {
                  this.set(key, obj[key]);
              }
           } catch (error) {
             return (opts.promise ? Promise.reject(error) : error);
          }
          return (opts.promise ? Promise.resolve(this) : this);
      }
}

module.exports = Collection;
