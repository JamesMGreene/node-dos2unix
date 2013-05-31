/*
 * dos2unix
 * https://github.com/JamesMGreene/node-dos2unix
 *
 * Copyright (c) 2013 James M. Greene
 * Licensed under the MIT license.
 */

'use strict';

// Built-in modules
var fs = require('fs');


var CONTROL_CHARS = {
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

var encodingAwareComparers;
var bomComparers;
(function() {
  var createEncodingAwareLessThanComparer = function(length, highIndex) {
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
  };
  var createEncodingAwareGreaterThanComparer = function(length, highIndex) {
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
  };
  var createEncodingAwareEqualToComparer = function(length) {
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
  };

  encodingAwareComparers = {
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
    'UTF-8': {
      '<': createEncodingAwareLessThanComparer(1, 0),
      '>': createEncodingAwareGreaterThanComparer(1, 0),
      '===': createEncodingAwareEqualToComparer(1)
    },
    '*': {
      '<': createEncodingAwareLessThanComparer(1, 0),
      '>': createEncodingAwareGreaterThanComparer(1, 0),
      '===': createEncodingAwareEqualToComparer(1)
    }
  };

  bomComparers = {
    'UTF-32BE': encodingAwareComparers['UTF-32BE']['==='],
    'UTF-32LE': encodingAwareComparers['UTF-32LE']['==='],
    'UTF-16BE': encodingAwareComparers['UTF-16BE']['==='],
    'UTF-16LE': encodingAwareComparers['UTF-16LE']['==='],
    // UTF-8 has different behavior for comparing BOMs than it does for comparing other bytes
    'UTF-8':    createEncodingAwareEqualToComparer(3)
  };
})();


var detectBomFromBuffer = (function() {
  var slicer = Array.prototype.slice;
  return function(buffer) {
    if (buffer && buffer.length > 1) {
      var encodingsWithBoms = ['UTF-32BE', 'UTF-32LE', 'UTF-16BE', 'UTF-16LE', 'UTF-8'];
      var enc, bom, potentialBom, equalTo;
      for (var e = 0, len = encodingsWithBoms.length; e < len; e++) {
        enc = encodingsWithBoms[e];
        bom = CONTROL_CHARS[enc].BOM;
        if (buffer.length >= bom.length) {
          // Duck-type with an `Array#slice` instead of `Buffer#slice`
          potentialBom = slicer.call(buffer, 0, bom.length);
          equalTo = bomComparers[enc];
          if (equalTo(potentialBom, bom)) {
            return enc;
          }
        }
        // else continue
      }
    }
    return null;
  };
})();

function detectBom(filePath, done) {
  var bom = null;
  var calledDone = false;
  // Read a max of the first 4 bytes (0-3)
  fs.createReadStream(filePath, { start: 0, end: 3 })
    .on('data', function(buffer) {
      // Should only get 1 'data' event for this 4-byte read
      bom = detectBomFromBuffer(buffer);
    })
    .on('error', function(err) {
      if (!calledDone) {
        done(new Error('Error while detecting BOM in "' + filePath + '": ' + (err.stack || err)), bom);
        calledDone = true;
      }
    })
    .on('end', function() {
      // 'end'should not be emitted if an 'error' is emitted
      if (!calledDone) {
        done(null, bom);
        calledDone = true;
      }
    })
    .resume();
}

function getBytesPerBom(bom) {
  return (CONTROL_CHARS[bom] || CONTROL_CHARS['*']).BOM.length;
}

function getBytesPerControlChar(bom) {
  return (CONTROL_CHARS[bom] || CONTROL_CHARS['*']).NUL.length;
}

function isByteSequenceCR(byteSequence, bom) {
  var controlChars = CONTROL_CHARS[bom] || CONTROL_CHARS['*'];
  var equalTo = (encodingAwareComparers[bom] || encodingAwareComparers['*'])['==='];
  return equalTo(byteSequence, controlChars.CR);
}

function isByteSequenceLF(byteSequence, bom) {
  var controlChars = CONTROL_CHARS[bom] || CONTROL_CHARS['*'];
  var equalTo = (encodingAwareComparers[bom] || encodingAwareComparers['*'])['==='];
  return equalTo(byteSequence, controlChars.LF);
}

function doesByteSequenceSuggestBinary(byteSequence, bom) {
  var controlChars = CONTROL_CHARS[bom] || CONTROL_CHARS['*'];
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


// Exports
module.exports = {
  detectBomFromBuffer: detectBomFromBuffer,
  detectBom: detectBom,
  getBytesPerBom: getBytesPerBom,
  getBytesPerControlChar: getBytesPerControlChar,
  isByteSequenceCR: isByteSequenceCR,
  isByteSequenceLF: isByteSequenceLF,
  doesByteSequenceSuggestBinary: doesByteSequenceSuggestBinary
};
