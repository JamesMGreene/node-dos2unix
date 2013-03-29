/*
 * dos2unix
 * https://github.com/JamesMGreene/node-dos2unix
 *
 * Copyright (c) 2013 James M. Greene
 * Licensed under the MIT license.
 */

'use strict';

// Built-in modules
var os = require('os');

// External modules
var glob = require('glob');
var Q = require('q');
var BinaryReader = require('buffered-reader').BinaryReader;
var extend = require('node.extend');

// Configuration
var globOptions = {
  nonull: false,
  nocase: true
};

// Utility functions
function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function unique(arr) {
  return (arr || []).filter(function(e, i, c) {
    return c.indexOf(e) === i;
  });
}

function validateDone(done) {
  if (typeof done !== 'function') {
    throw new TypeError('`done` must be a function');
  }
  return done;
}

function validateOptions(opts, done) {
  var cleanOpts = {
    glob: {}
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

function validatePatterns(patterns, done) {
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

var globP = Q.nfbind(glob);
function resolveGlobAsync(patterns, overrideOptions, done) {
  var files = [];
  var opts = JSON.parse(JSON.stringify(globOptions));
  if (overrideOptions) {
    Object.keys(overrideOptions).forEach(function(key) {
      opts[key] = overrideOptions[key];
    });
  }
  Q.allResolved(
    patterns.map(function(pattern) {
      // Relative patterns are matched against the current working directory.
      return globP(pattern, opts)
        .then(function(globbedFiles) {
          if (isArray(globbedFiles) && globbedFiles.length > 0) {
            files.push.apply(globbedFiles);
          }
          else {
            console.error('The glob pattern "' + pattern + '" did not match any files!');
          }
        });
    })
  ).then(function() {
    // Get rid of any duplicates and sort it
    done(null, unique(files).sort());
  }).fail(function(err) {
    done(err);
  }).done();
}

var exemptControlChars = {
  'UTF-32BE': {
    'BOM': [0x00, 0x00, 0xFE, 0xFF],
    'NUL': [0x00, 0x00, 0x00, 0x00],
    'HT':  [0x00, 0x00, 0x00, 0x09],
    'LF':  [0x00, 0x00, 0x00, 0x0A],
    'VT':  [0x00, 0x00, 0x00, 0x0B],
    'FF':  [0x00, 0x00, 0x00, 0x0C],
    'CR':  [0x00, 0x00, 0x00, 0x0D],
    'SP':  [0x00, 0x00, 0x00, 0x20]
  },
  'UTF-32LE': {
    'BOM': [0xFF, 0xFE, 0x00, 0x00],
    'NUL': [0x00, 0x00, 0x00, 0x00],
    'HT':  [0x09, 0x00, 0x00, 0x00],
    'LF':  [0x0A, 0x00, 0x00, 0x00],
    'VT':  [0x0B, 0x00, 0x00, 0x00],
    'FF':  [0x0C, 0x00, 0x00, 0x00],
    'CR':  [0x0D, 0x00, 0x00, 0x00],
    'SP':  [0x20, 0x00, 0x00, 0x00]
  },
  'UTF-16BE': {
    'BOM': [0xFE, 0xFF],
    'NUL': [0x00, 0x00],
    'HT':  [0x00, 0x09],
    'LF':  [0x00, 0x0A],
    'VT':  [0x00, 0x0B],
    'FF':  [0x00, 0x0C],
    'CR':  [0x00, 0x0D],
    'SP':  [0x00, 0x20]
  },
  'UTF-16LE': {
    'BOM': [0xFF, 0xFE],
    'NUL': [0x00, 0x00],
    'HT':  [0x09, 0x00],
    'LF':  [0x0A, 0x00],
    'VT':  [0x0B, 0x00],
    'FF':  [0x0C, 0x00],
    'CR':  [0x0D, 0x00],
    'SP':  [0x20, 0x00]
  },
  'UTF-8': {
    'BOM': [0xEF, 0xBB, 0xBF],
    'NUL': [0x00],
    'HT':  [0x09],
    'LF':  [0x0A],
    'VT':  [0X0B],
    'FF':  [0x0C],
    'CR':  [0x0D],
    'SP':  [0x20]
  },
  '*': {
    'BOM': [],
    'NUL': [0x00],
    'HT':  [0x09],
    'LF':  [0x0A],
    'VT':  [0X0B],
    'FF':  [0x0C],
    'CR':  [0x0D],
    'SP':  [0x20]
  }
};

function createEncodingAwareLessThanComparer(length, highIndex) {
  return function(bs1, bs2) {
    var bothExist = !!bs1 && !!bs2;
    if (!bothExist) {
      return false;
    }
    
    var bothHaveExpectedLength = bs1.length === length && bs2.length === length;
    if (!bothHaveExpectedLength) {
      return false;
    }
    
    var b;
    if (highIndex === 0) {
      for (b = highIndex; b < length; b += 1) {
        if (bs1[b] < bs2[b]) {
          return true;
        }
        else if (bs1[b] !== bs2[b]) {
          return false;
        }
        // else continue
      }
    }
    else if (highIndex === -1) {
      for (b = length - 1; b > -1; b += -1) {
        if (bs1[b] < bs2[b]) {
          return true;
        }
        else if (bs1[b] !== bs2[b]) {
          return false;
        }
        // else continue
      }
    }
    return false;
  };
}
function createEncodingAwareGreaterThanComparer(length, highIndex) {
  return function(bs1, bs2) {
    var bothExist = !!bs1 && !!bs2;
    if (!bothExist) {
      return false;
    }
    
    var bothHaveExpectedLength = bs1.length === length && bs2.length === length;
    if (!bothHaveExpectedLength) {
      return false;
    }
    
    var b;
    if (highIndex === 0) {
      for (b = highIndex; b < length; b += 1) {
        if (bs1[b] > bs2[b]) {
          return true;
        }
        else if (bs1[b] !== bs2[b]) {
          return false;
        }
        // else continue
      }
    }
    else if (highIndex === -1) {
      for (b = length - 1; b > -1; b += -1) {
        if (bs1[b] > bs2[b]) {
          return true;
        }
        else if (bs1[b] !== bs2[b]) {
          return false;
        }
        // else continue
      }
    }
    return false;
  };
}
function createEncodingAwareEqualToComparer(length) {
  return function(bs1, bs2) {
    var bothExist = !!bs1 && !!bs2;
    if (!bothExist) {
      return false;
    }
    
    var bothHaveExpectedLength = bs1.length === length && bs2.length === length;
    if (!bothHaveExpectedLength) {
      return false;
    }
    
    for (var b = 0; b < length; b++) {
      if (bs1[b] !== bs2[b]) {
        return false;
      }
      // else continue
    }
    return true;
  };
}

var encodingAwareComparers = {
  'UTF-32BE': {
    '<': createEncodingAwareLessThanComparer(4, 0),
    '>': createEncodingAwareGreaterThanComparer(4, 0),
    '===': createEncodingAwareEqualToComparer(4)
  },
  'UTF-32LE': {
    '<': createEncodingAwareLessThanComparer(4, -1),
    '>': createEncodingAwareGreaterThanComparer(4, -1),
    '===': createEncodingAwareEqualToComparer(4)
  },
  'UTF-16BE': {
    '<': createEncodingAwareLessThanComparer(2, 0),
    '>': createEncodingAwareGreaterThanComparer(2, 0),
    '===': createEncodingAwareEqualToComparer(2)
  },
  'UTF-16LE': {
    '<': createEncodingAwareLessThanComparer(2, -1),
    '>': createEncodingAwareGreaterThanComparer(2, -1),
    '===': createEncodingAwareEqualToComparer(2)
  },
  '*': {
    '<': createEncodingAwareLessThanComparer(1, 0),
    '>': createEncodingAwareGreaterThanComparer(1, 0),
    '===': createEncodingAwareEqualToComparer(1)
  }
};

function doesByteSequenceSuggestBinary(byteSequence, bom) {
  var controlChars = exemptControlChars[bom] || exemptControlChars['*'];
  var comparers = encodingAwareComparers[bom] || encodingAwareComparers['*'];
  var lessThan = comparers['<'];
  var equalTo = comparers['==='];
  
  return lessThan(byteSequence, controlChars.SP) &&
          !(
            equalTo(byteSequence, controlChars.NUL) ||
            equalTo(byteSequence, controlChars.HT) ||
            equalTo(byteSequence, controlChars.VT) ||
            equalTo(byteSequence, controlChars.CR) ||
            equalTo(byteSequence, controlChars.LF) ||
            equalTo(byteSequence, controlChars.FF)
          );
}

function isByteSequenceCR(byteSequence, bom) {
  var controlChars = exemptControlChars[bom] || exemptControlChars['*'];
  var equalTo = (encodingAwareComparers[bom] || encodingAwareComparers['*'])['==='];
  return equalTo(byteSequence, controlChars.CR);
}

function isByteSequenceLF(byteSequence, bom) {
  var controlChars = exemptControlChars[bom] || exemptControlChars['*'];
  var equalTo = (encodingAwareComparers[bom] || encodingAwareComparers['*'])['==='];
  return equalTo(byteSequence, controlChars.LF);
}

function determineBomFromBuffer(buffer) {
  var bom = null;
  var bomChars = {};
  Object.keys(exemptControlChars).forEach(function(encodingKey) {
    bomChars[encodingKey] = exemptControlChars[encodingKey].BOM;
  });
  var comparers = encodingAwareComparers;
  if (buffer && buffer.length > 1) {
    // UTF-32BE (Big Endian)
    if (buffer.length >= bomChars['UTF-32BE'].length && comparers['UTF-32BE']['==='](buffer.slice(0, bomChars['UTF-32BE'].length), bomChars['UTF-32BE'])) {
      bom = 'UTF-32BE';
    }
    // UTF-32LE (Little Endian)
    else if (buffer.length >= bomChars['UTF-32LE'].length && comparers['UTF-32LE']['==='](buffer.slice(0, bomChars['UTF-32LE'].length), bomChars['UTF-32LE'])) {
      bom = 'UTF-32LE';
    }
    // UTF-16BE (Big Endian)
    else if (buffer.length >= bomChars['UTF-16BE'].length && comparers['UTF-16BE']['==='](buffer.slice(0, bomChars['UTF-16BE'].length), bomChars['UTF-16BE'])) {
      bom = 'UTF-16BE';
    }
    // UTF-16LE (Little Endian)
    else if (buffer.length >= bomChars['UTF-16LE'].length && comparers['UTF-16LE']['==='](buffer.slice(0, bomChars['UTF-16LE'].length), bomChars['UTF-16LE'])) {
      bom = 'UTF-16LE';
    }
    // UTF-8
    else if (buffer.length >= bomChars['UTF-8'].length && comparers['UTF-8']['==='](buffer.slice(0, bomChars['UTF-8'].length), bomChars['UTF-8'])) {
      bom = 'UTF-8';
    }
  }
  return bom;
}

function detectBom(filePath, done) {
  var reader = new BinaryReader(filePath);
  reader.read(4, function(err, buffer /*, bytesRead */) {
    var bom = determineBomFromBuffer(buffer);
    reader.close(function(errClosing) {
      if (errClosing) {
        console.error('Error like detecting BOM in "' + filePath + '": ' + (errClosing.stack || errClosing));
      }
      return done(err, bom);
    });
  });
}

function getBytesPerBom(bom) {
  return (exemptControlChars[bom] || exemptControlChars['*']).BOM.length;
}

function getBytesPerControlChar(bom) {
  return (exemptControlChars[bom] || exemptControlChars['*']).NUL.length;
}

function SafeWriter(shouldBuffer, consoleMethodName) {
  if (!this instanceof SafeWriter) {
    return new SafeWriter(shouldBuffer, consoleMethodName);
  }

  if (shouldBuffer) {
    var messages = [];
    this.write = function(msg) {
      messages.push(msg);
      process.stderr.write('std{out|err}.write = ' + msg);
    };
    this.flush = function() {
      return messages.join(os.EOL);
    };
  }
  else if (typeof consoleMethodName === 'string' &&
    consoleMethodName &&
    consoleMethodName in console &&
    typeof console[consoleMethodName] === 'function'
  ) {
    this.write = function(msg) {
      console[consoleMethodName](msg);
      process.stderr.write('console.' + consoleMethodName + ' = ' + msg);
    };
    this.flush = function() {
      return undefined;
    };
  }
  else {
    throw new TypeError('`shouldBuffer` was `false` but `consoleMethodName` ("' + consoleMethodName + '") is not a property in `console`.`');
  }
}

function createStdoutWriter(shouldBuffer) {
  return new SafeWriter(shouldBuffer, 'log');
}

function createStderrWriter(shouldBuffer) {
  return new SafeWriter(shouldBuffer, 'error');
}

// Exports
module.exports = {
  // Sync methods
  determineBomFromBuffer: determineBomFromBuffer,
  getBytesPerBom: getBytesPerBom,
  getBytesPerControlChar: getBytesPerControlChar,
  doesByteSequenceSuggestBinary: doesByteSequenceSuggestBinary,
  isByteSequenceCR: isByteSequenceCR,
  isByteSequenceLF: isByteSequenceLF,
  createStdoutWriter: createStdoutWriter,
  createStderrWriter: createStderrWriter,
  validateDone: validateDone,
  // Async methods
  validateOptions: validateOptions,
  validatePatterns: validatePatterns,
  resolveGlobAsync: resolveGlobAsync,
  detectBom: detectBom
};
