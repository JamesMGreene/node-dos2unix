/*
 * dos2unix
 * https://github.com/JamesMGreene/node-dos2unix
 *
 * Copyright (c) 2013 James M. Greene
 * Licensed under the MIT license.
 */

'use strict';

// External modules
var extend = require('node.extend');

// Internal modules
var globber = require('./glob');


// Utility functions
function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}


function validateDone(done, relax) {
  if (typeof done !== 'function') {
    if (!relax) {
      throw new TypeError('`done` must be a function');
    }
    else {
      done = function(err) {
        throw err;
      };
    }
  }
  return done;
}

function validateOptions(opts, done) {
  var cleanOpts = {
    glob: globber.defaults
  };
  if (opts) {
    // glob
    var typeOfGlob = typeof opts.glob;
    if (typeOfGlob === 'object' && opts.glob !== null) {
      cleanOpts.glob = extend(true, cleanOpts.glob || {}, opts.glob);
    }
    else if (opts.glob != null) {
      done(new TypeError('`glob` expects an Object type but was: ' + typeOfGlob));
    }
  }
  return cleanOpts;
}

function validateGlobPatterns(patterns, done) {
  if (typeof patterns === 'string') {
    if (!patterns) {
      done(new TypeError('`patterns` cannot be an empty string'));
      return;
    }
    patterns = [patterns];
  }
  if (!isArray(patterns)) {
    done(new TypeError('`patterns` must either be a string or an array'));
    return;
  }
  if (patterns.length < 1) {
    done(new TypeError('`patterns` cannot be an empty array'));
    return;
  }
  return patterns;
}



// Exports
module.exports = {
  validateDone: validateDone,
  validateOptions: validateOptions,
  validateGlobPatterns: validateGlobPatterns
};
