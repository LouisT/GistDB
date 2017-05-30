/*!
 * Use `gist` as a key/value database. - https://ltdev.im/ - Copyright (c) 2017 Louis T.
 * Licensed under MIT license https://raw.githubusercontent.com/LouisT/GistDB/master/UNLICENSE
 */
const axios = require('axios'),
      semver = require('semver'),
      util = require('util'),
      Collections = require('./Collections'),
      pkg = require('../package.json');

class GistDB {
      constructor (options = {}) {
          this.settings = Object.assign({
              database: {
                 gist: null,
              },
              api: 'https://api.github.com',
              timeout: 30000,
              headers: {
                  Accept: 'application/vnd.github.v3+json'
              }
          }, options);

          this.collections = new Collections();

          // If the token is found generate the auth header; otherwise this is just a Map().
          if (this.settings.token) {
             this.settings.headers['Authorization'] = util.format('token %s', this.settings.token);
          }

          this.axios = axios.create({
              baseURL: this.settings.api,
              timeout: this.settings.timeout,
              headers: this.settings.headers
          });

          // Validate requests before sending them.
          this.axios.interceptors.request.use((config) => {
              // Only allow one REMOTE request at a time; prevent data loss.
              if (this.__locked) {
                 return Promise.reject(new Error('Request in progress, please wait.'));
              }
              // The auth header is REQUIRED to make GitHub API requests.
              if (!config.headers.Authorization) {
                 return Promise.reject(new Error('Personal access token is required! See: https://github.com/settings/tokens'));
              }
              this.__locked = true;
              return config;
           }, (error) => {
              this.__locked = false;
              return Promise.reject(error);
          });

          // Remove the lock AFTER request is finished.
          this.axios.interceptors.response.use((response) => {
              this.__locked = false;
              return response;
           }, (error) => {
              this.__locked = false;
              return Promise.reject(error);
          });

      }

      get gist () {
          return this.settings.database.gist;
      }
      set gist (gist) {
          this.settings.database.gist = gist;
      }
      get id () { return this.gist; }
      set id (gist) { this.gist = gist; }

      collection (name = 'GistDB', defaults = '{}') {
          if (this.collections.has(name)) {
             return this.collections.get(name);
           } else {
             return this.collections.addSync(name, defaults);
          }
      }

      load (options = {}) {
          let opts = Object.assign({}, this.settings, options);
          if (!opts.database.gist) {
             return Promise.reject(new Error('Gist ID is required!'));
          }
          if (opts.token) {
             this.axios.defaults.headers.common['Authorization'] = util.format('token %s', opts.token);
          }
          return this.axios.get(util.format('/gists/%s', opts.database.gist)).then((res) => {
              if (semver.satisfies(res.data.description, pkg.database.compatible)) {
                 return Promise.all(Object.keys(res.data.files).map((file) => {
                     return this.collections.add(file, res.data.files[file].content);
                  })).then(() => {
                     this.gist = res.data.id;
                     return Promise.resolve(this);
                 });
               } else {
                 return Promise.reject(new Error(util.format('Invalid database version! Current v%s; expecting %s.', res.data.description, pkg.database.compatible)));
              }
          });
      }

      destroy (options = {}) {
          let opts = Object.assign({}, this.settings, options);
          if (!opts.database.gist) {
             return Promise.reject(new Error('Gist ID is required!'));
          }
          if (opts.token) {
             this.axios.defaults.headers.common['Authorization'] = util.format('token %s', opts.token);
          }
          return this.axios.delete(util.format('/gists/%s', opts.database.gist));
      }

      // XXX: Temporary wrapper of `save()`, will do more later.
      init (options = {}) {
           return this.save(options);
      }

      save (options = {}) {
          let opts = Object.assign({ public: false }, this.settings, options, {
              description: util.format('%s', pkg.version)
          });
          if (opts.token) {
             this.axios.defaults.headers.common['Authorization'] = util.format('token %s', opts.token);
          }
          if (!opts.database.gist) {
             // Generate the @METADATA collection.
             this.collections.addSync('@METADATA', JSON.stringify({
                 init: Date.now(),
                 updated: Date.now(),
                 version: pkg.version,
                 compatibility: pkg.database.compatible,
                 collections: ['@METADATA']
             }));
             // Initiate the database.
             return this.axios.post('/gists', {
                 public: opts.public,
                 description: opts.description,
                 files: this.generateFiles(options)
              }).then((res) => {
                 return this.save({
                     database: {
                         gist: res.data.id
                     }
                 });
             });
          }
          if (this.collections.has('@METADATA')) {
             this.collections.get('@METADATA')
                 .set('updated', Date.now())
                 .set('collections', [...this.collections.keys()]);
           } else {
             return Promise.reject(new Error('@METADATA collection does not exist; load() before save()!'));
          }
          return this.axios.patch(util.format('/gists/%s', opts.database.gist), {
              description: opts.description,
              files: this.generateFiles(options)
           }).then((res) => {
              this.gist = res.data.id;
              return Promise.resolve(this);
          });
      }


      /*
       * Get an object of GistDB files.
       */
      generateFiles (options = {}) {
          let obj = {};
          for (let key of this.collections.keys()) {
              obj[key] = {
                  content: this.collections.get(key).toJSON(options)
              };
          };
          return obj;
      }

}

module.exports = GistDB;
