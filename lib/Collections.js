/*!
 * Use `gist` as a key/value database. - https://ltdev.im/ - Copyright (c) 2017 Louis T.
 * Licensed under MIT license https://raw.githubusercontent.com/LouisT/GistDB/master/UNLICENSE
 */
const MapDSL = require('mapdsl/chainable'),
      Collection = require('./Collection');

class Collections extends MapDSL {
      constructor (_map) {
          super(_map);
      }

      addSync (name, data) {
          return this.set(name, new Collection()).get(name).fromJSON(data, {
              promise: false
          });
      }

      add (name, data) {
          return new Promise((resolve, reject) => {
             this.set(name, new Collection());
             return this.get(name).fromJSON(data).then((col) => {
                 resolve(col);
              }).catch((error) => {
                 reject(error);
             });
          });
      }
}

module.exports = Collections;
