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
var async = require('async');
var extend = require('node.extend');


// Utility functions
function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function omitDirs(arr) {
  return (arr || []).filter(function(e) {
    var lastChar = e.slice(-1);
    return lastChar !== '/' && lastChar !== '\\';
  });
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


// Configuration
var defaultOptions = {
  nonull: false,
  nocase: true,
  mark: true
};

// Public methods
function resolveGlobAsync(patterns, options, done) {
  var opts = extend(true, {}, defaultOptions, options);

  // Relative patterns are matched against the current working directory.
  var globIterator = function(pattern, callback) {
    glob(pattern, opts, function(err, globbedFiles) {
      if (isArray(globbedFiles) && globbedFiles.length && !err) {
        callback(null, globbedFiles);
      }
      else {
        console.error('The glob pattern ' + JSON.stringify(pattern) + ' did not match any files!');
        callback(null, []);
      }
    });
  };
  async.concat(patterns, globIterator, function(err, files) {
    if (err) {
      done(err);
      return;
    }
    // Get rid of any duplicates and sort it
    var _cwd = opts.cwd || process.cwd();
    var polishedList = prependAll(unique(omitDirs(files)), _cwd).sort();
    done(null, polishedList);
  });
}



// Exports
module.exports = {
  defaults: defaultOptions,
  glob: resolveGlobAsync
};
