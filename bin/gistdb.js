#!/usr/bin/env node
/*!
 * GistDB CLI - https://ltdev.im/ - Copyright (c) 2017 Louis T.
 * Licensed under MIT license https://raw.githubusercontent.com/LouisT/GistDB/master/UNLICENSE
 */
let GistDB = require('../'),
    program = require('commander');

program
  .version('1.0.0')
  .command('init <token>')
  .action((token) => {
      new GistDB({ token: token }).init().then(function (database) {
          console.log('GistDB Initated: %s', database.gist);
       }).catch((error) => {
          // XXX: Add better error message support!
          console.trace(error);
      });
  });

program
  .option('-a, --about', 'Display GistDB information.')
  .on('--help', function () {
      console.log('  Example:');
      console.log('');
      console.log('    $ gistdb init [token]');
      console.log('');
      console.log('  Generate a personal access token:');
      console.log('      https://github.com/settings/tokens');
      console.log('');
  });

program.parse(process.argv);
if (program.about) {
   var pkg = require('../package.json');
   console.log('GistDB v%s (DB Compat: %s), GistDB CLI v%s', pkg.version, pkg.database.compatible, program._version);
   console.log('By %s <%s> (%s)', pkg.author.name, pkg.author.email, pkg.author.url);
   console.log('\nHomepage: %s\nBugs: %s', pkg.homepage, pkg.bugs.url);
 } else if (!program.args.length) {
   program.help();
}
