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

function validateOptions(opts) {
  var cleanOpts = {
    glob: globber.defaults,
    maxConcurrency: 0  /* unlimited */
  };
  if (opts) {
    // glob
    var typeOfGlob = typeof opts.glob;
    if (typeOfGlob === 'object' && opts.glob !== null) {
      cleanOpts.glob = extend(true, {}, cleanOpts.glob, opts.glob);
    }
    else if (opts.glob != null) {
      throw new TypeError('`glob` expects an Object type but was: ' + typeOfGlob);
    }

    // maxConcurrency
    var typeOfMaxConcurrency = typeof opts.maxConcurrency;
    if (typeOfMaxConcurrency === 'number') {
      if (opts.maxConcurrency > 0) {
        cleanOpts.maxConcurrency = opts.maxConcurrency;
      }
      else {
        cleanOpts.maxConcurrency = 0;
      }
    }
    else if (opts.maxConcurrency != null) {
      throw new TypeError('`maxConcurrency` expects a Number type but was: ' + typeOfMaxConcurrency);
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
  done(null, patterns);
}



// Exports
module.exports = {
  validateOptions: validateOptions,
  validateGlobPatterns: validateGlobPatterns
};
