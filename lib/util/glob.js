/*
 * dos2unix
 * https://github.com/JamesMGreene/node-dos2unix
 *
 * Copyright (c) 2013 James M. Greene
 * Licensed under the MIT license.
 */

'use strict';

// Built-in modules
var path = require('path');

// External modules
var glob = require('glob');
var Q = require('q');


// Utility functions
function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function unique(arr) {
  return (arr || []).filter(function(e, i, c) {
    return c.indexOf(e) === i;
  });
}

function prependAll(arr, prefixPath) {
  return (arr || []).map(function(e) {
    return path.join(prefixPath, e);
  });
}

// Q promise-wrapped function
var globP = Q.nfbind(glob);


// Configuration
var defaultOptions = {
  nonull: false,
  nocase: true
};

// Public methods
function resolveGlobAsync(patterns, options, done) {
  var files = [];
  var opts = options || defaultOptions;
  Q.allResolved(
    patterns.map(function(pattern) {
      // Relative patterns are matched against the current working directory.
      return globP(pattern, opts)
        .then(function(globbedFiles) {
          if (isArray(globbedFiles) && globbedFiles.length > 0) {
            files.push.apply(files, globbedFiles);
          }
          else {
            console.error('The glob pattern "' + pattern + '" did not match any files!');
          }
        });
    })
  )
  .then(function() {
    // Get rid of any duplicates and sort it
    var polishedList = prependAll(unique(files), process.cwd()).sort();
    done(null, polishedList);
  })
  .fail(done)
  .done();
}



// Exports
module.exports = {
  defaults: defaultOptions,
  glob: resolveGlobAsync
};
