'use strict';

// Built-in modules
var fs = require('fs');

// Internal modules
var encoder = require('../../lib/util/encoding');

// Test helper
var encodingHelper = (function() {
  var emptyByte = 0x00;

  function charFromByte(oneByte, bom) {
    switch (bom) {
      case 'UTF-32BE':
        return [emptyByte, emptyByte, emptyByte, oneByte];
      case 'UTF-32LE':
        return [oneByte, emptyByte, emptyByte, emptyByte];
      case 'UTF-16BE':
        return [emptyByte, oneByte];
      case 'UTF-16LE':
        return [oneByte, emptyByte];
      default:
        return [oneByte];
    }
  }

  var asOctet = (function() {
    function pad2(s) {
      var str = s || '';
      var missingLen = 2 - (str || '').length;
      if (missingLen > 0) {
        return (new Array(missingLen + 1)).join('0') + str;
      }
      return str;
    }

    return function(oneByte) {
      return '0x' + pad2(oneByte.toString(16)).toUpperCase();
    };
  })();

  return {
    charFromByte: charFromByte,
    asOctet: asOctet
  };

})();

// DEBUG!
// Set this to `true` to make the `detectBomFromBuffer` unit tests
// write out the test data files for the `detectBom` unit tests.
var DEBUG_WRITE_OUT_TESTFILES = false;

// Override the `console.log` and `console.error` methods
var _console = {
  log: console.log,
  error: console.error
};

var _cwd = process.cwd();
var noop = function() {};

exports['encoding'] = {
  setUp: function(done) {
    // Silence the console methods
    console.log = noop;
    console.error = noop;

    // Change the CWD to: {repo}/test/
    process.chdir(__dirname + '/../');

    // Finish `setUp`
    done();
  },
  tearDown: function(done) {
    // Revert the console methods
    console.log = _console.log;
    console.error = _console.error;

    // Revert the CWD
    process.chdir(_cwd);

    // Finish `tearDown`
    done();
  },

  'detectBomFromBuffer: UTF-32BE': function(test) {
    test.expect(1);

    var bomBuffer = new Buffer([0x00, 0x00, 0xFE, 0xFF]);
    var msgBuffer = new Buffer([
      0x00, 0x00, 0x00, 0x55,  /* "U" */
      0x00, 0x00, 0x00, 0x54,  /* "T" */
      0x00, 0x00, 0x00, 0x46,  /* "F" */
      0x00, 0x00, 0x00, 0x2D,  /* "-" */
      0x00, 0x00, 0x00, 0x33,  /* "3" */
      0x00, 0x00, 0x00, 0x32,  /* "2" */
      0x00, 0x00, 0x00, 0x42,  /* "B" */
      0x00, 0x00, 0x00, 0x45,  /* "E" */
      0x00, 0x00, 0x00, 0x20,  /* " " */
      0x00, 0x00, 0x26, 0x03   /* "☃" (snowman) */
    ]);
    var buffer = Buffer.concat([bomBuffer, msgBuffer], bomBuffer.length + msgBuffer.length);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf32be.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, 'UTF-32BE');
    test.done();
  },

  'detectBomFromBuffer: UTF-32LE': function(test) {
    test.expect(1);

    var bomBuffer = new Buffer([0xFF, 0xFE, 0x00, 0x00]);
    var msgBuffer = new Buffer([
      0x55, 0x00, 0x00, 0x00,  /* "U" */
      0x54, 0x00, 0x00, 0x00,  /* "T" */
      0x46, 0x00, 0x00, 0x00,  /* "F" */
      0x2D, 0x00, 0x00, 0x00,  /* "-" */
      0x33, 0x00, 0x00, 0x00,  /* "3" */
      0x32, 0x00, 0x00, 0x00,  /* "2" */
      0x4C, 0x00, 0x00, 0x00,  /* "L" */
      0x45, 0x00, 0x00, 0x00,  /* "E" */
      0x20, 0x00, 0x00, 0x00,  /* " " */
      0x03, 0x26, 0x00, 0x00   /* "☃" (snowman) */
    ]);
    var buffer = Buffer.concat([bomBuffer, msgBuffer], bomBuffer.length + msgBuffer.length);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf32le.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, 'UTF-32LE');
    test.done();
  },

  'detectBomFromBuffer: UTF-16BE': function(test) {
    test.expect(1);

    var bomBuffer = new Buffer([0xFE, 0xFF]);
    var msgBuffer = new Buffer([
      0x00, 0x55,  /* "U" */
      0x00, 0x54,  /* "T" */
      0x00, 0x46,  /* "F" */
      0x00, 0x2D,  /* "-" */
      0x00, 0x31,  /* "1" */
      0x00, 0x36,  /* "6" */
      0x00, 0x42,  /* "B" */
      0x00, 0x45,  /* "E" */
      0x00, 0x20,  /* " " */
      0x26, 0x03   /* "☃" (snowman) */
    ]);
    var buffer = Buffer.concat([bomBuffer, msgBuffer], bomBuffer.length + msgBuffer.length);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf16be.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, 'UTF-16BE');
    test.done();
  },

  'detectBomFromBuffer: UTF-16LE': function(test) {
    test.expect(1);

    var bomBuffer = new Buffer([0xFF, 0xFE]);
    var msgBuffer = new Buffer([
      0x55, 0x00,  /* "U" */
      0x54, 0x00,  /* "T" */
      0x46, 0x00,  /* "F" */
      0x2D, 0x00,  /* "-" */
      0x31, 0x00,  /* "1" */
      0x36, 0x00,  /* "6" */
      0x4C, 0x00,  /* "L" */
      0x45, 0x00,  /* "E" */
      0x20, 0x00,  /* " " */
      0x03, 0x26   /* "☃" (snowman) */
    ]);
    var buffer = Buffer.concat([bomBuffer, msgBuffer], bomBuffer.length + msgBuffer.length);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf16le.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, 'UTF-16LE');
    test.done();
  },

  'detectBomFromBuffer: UTF-8': function(test) {
    test.expect(1);

    var bomBuffer = new Buffer([0xEF, 0xBB, 0xBF]);
    var msgBuffer = new Buffer([
      0x55,             /* "U" */
      0x54,             /* "T" */
      0x46,             /* "F" */
      0x2D,             /* "-" */
      0x38,             /* "8" */
      0x20,             /* " " */
      0xE2, 0x98, 0x83  /* "☃" (snowman) */
    ]);
    var buffer = Buffer.concat([bomBuffer, msgBuffer], bomBuffer.length + msgBuffer.length);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf8.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, 'UTF-8');
    test.done();
  },

  'detectBomFromBuffer: UTF-8, no BOM': function(test) {
    test.expect(1);

    var buffer = new Buffer([
      0x55,              /* "U" */
      0x54,              /* "T" */
      0x46,              /* "F" */
      0x2D,              /* "-" */
      0x38,              /* "8" */
      0x20,              /* " " */
      0xE2, 0x98, 0x83,  /* "☃" (snowman) */
      0x20,              /* " " */
      0x28,              /* "(" */
      0x6E,              /* "n" */
      0x6F,              /* "o" */
      0x20,              /* " " */
      0x42,              /* "B" */
      0x4F,              /* "O" */
      0x4D,              /* "M" */
      0x29               /* ")" */
    ]);
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/utf8-noBom.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, null);
    test.done();
  },

  'detectBomFromBuffer: some other encoding with no BOM': function(test) {
    test.expect(1);

    var buffer = new Buffer([0x41, 0x53, 0x43, 0x49, 0x49]);  // "ASCII"
    (function() {
      // DEBUG
      if (DEBUG_WRITE_OUT_TESTFILES === true) {
        fs.writeFileSync('fixtures/util/encoding/bom/ascii.txt', buffer);
      }
    })();
    var bom = encoder.detectBomFromBuffer(buffer);
    test.equal(bom, null);
    test.done();
  },

  'detectBom: UTF-32BE': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf32be.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, 'UTF-32BE');
      test.done();
    });
  },

  'detectBom: UTF-32LE': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf32le.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, 'UTF-32LE');
      test.done();
    });
  },

  'detectBom: UTF-16BE': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf16be.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, 'UTF-16BE');
      test.done();
    });
  },

  'detectBom: UTF-16LE': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf16le.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, 'UTF-16LE');
      test.done();
    });
  },

  'detectBom: UTF-8': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf8.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, 'UTF-8');
      test.done();
    });
  },

  'detectBom: UTF-8, no BOM': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/utf8-noBom.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, null);
      test.done();
    });
  },

  'detectBom: some other encoding with no BOM': function(test) {
    test.expect(3);

    var testFilePath = 'fixtures/util/encoding/bom/ascii.txt';
    test.ok(fs.existsSync(testFilePath));
    encoder.detectBom(testFilePath, function(err, bom) {
      test.ok(!err);
      test.equal(bom, null);
      test.done();
    });
  },

  'getBytesPerBom': function(test) {
    test.expect(6);
    test.equal(encoder.getBytesPerBom('UTF-32BE'), 4);
    test.equal(encoder.getBytesPerBom('UTF-32LE'), 4);
    test.equal(encoder.getBytesPerBom('UTF-16BE'), 2);
    test.equal(encoder.getBytesPerBom('UTF-16LE'), 2);
    test.equal(encoder.getBytesPerBom('UTF-8'), 3);
    test.equal(encoder.getBytesPerBom('ASCII'), 0);
    test.done();
  },

  'getBytesPerControlChar': function(test) {
    test.expect(6);
    test.equal(encoder.getBytesPerControlChar('UTF-32BE'), 4);
    test.equal(encoder.getBytesPerControlChar('UTF-32LE'), 4);
    test.equal(encoder.getBytesPerControlChar('UTF-16BE'), 2);
    test.equal(encoder.getBytesPerControlChar('UTF-16LE'), 2);
    test.equal(encoder.getBytesPerControlChar('UTF-8'), 1);
    test.equal(encoder.getBytesPerControlChar('ASCII'), 1);
    test.done();
  },

  'isByteSequenceCR': function(test) {
    test.expect(36);

    // positive
    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'UTF-32BE'), true);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'UTF-32LE'), true);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'UTF-16BE'), true);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'UTF-16LE'), true);
    test.equal(encoder.isByteSequenceCR([0x0D], 'UTF-8'), true);
    test.equal(encoder.isByteSequenceCR([0x0D], 'ASCII'), true);

    // negative
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0A], 'UTF-32BE'), false);

    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0A, 0x00, 0x00, 0x00], 'UTF-32LE'), false);

    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0A], 'UTF-16BE'), false);

    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceCR([0x0A, 0x00], 'UTF-16LE'), false);

    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceCR([0x0A], 'UTF-8'), false);

    test.equal(encoder.isByteSequenceCR([0x00, 0x00, 0x00, 0x0D], 'ASCII'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00, 0x00, 0x00], 'ASCII'), false);
    test.equal(encoder.isByteSequenceCR([0x00, 0x0D], 'ASCII'), false);
    test.equal(encoder.isByteSequenceCR([0x0D, 0x00], 'ASCII'), false);
    test.equal(encoder.isByteSequenceCR([0x0A], 'ASCII'), false);

    test.done();
  },

  'isByteSequenceLF': function(test) {
    test.expect(36);

    // positive
    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'UTF-32BE'), true);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'UTF-32LE'), true);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'UTF-16BE'), true);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'UTF-16LE'), true);
    test.equal(encoder.isByteSequenceLF([0x0A], 'UTF-8'), true);
    test.equal(encoder.isByteSequenceLF([0x0A], 'ASCII'), true);

    // negative
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'UTF-32BE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0D], 'UTF-32BE'), false);

    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'UTF-32LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0D, 0x00, 0x00, 0x00], 'UTF-32LE'), false);

    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'UTF-16BE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0D], 'UTF-16BE'), false);

    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'UTF-16LE'), false);
    test.equal(encoder.isByteSequenceLF([0x0D, 0x00], 'UTF-16LE'), false);

    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'UTF-8'), false);
    test.equal(encoder.isByteSequenceLF([0x0D], 'UTF-8'), false);

    test.equal(encoder.isByteSequenceLF([0x00, 0x00, 0x00, 0x0A], 'ASCII'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00, 0x00, 0x00], 'ASCII'), false);
    test.equal(encoder.isByteSequenceLF([0x00, 0x0A], 'ASCII'), false);
    test.equal(encoder.isByteSequenceLF([0x0A, 0x00], 'ASCII'), false);
    test.equal(encoder.isByteSequenceLF([0x0D], 'ASCII'), false);

    test.done();
  },

  'doesByteSequenceSuggestBinary': function(test) {
    var boms = ['UTF-32BE', 'UTF-32LE', 'UTF-16BE', 'UTF-16LE', 'UTF-8', 'ASCII'];

    // positive - char with main bytes between 0x01 and 0x19 (inclusive),
    //            EXCEPT for whitespace bytes (0x09, 0x0A, 0x0B, 0x0C, 0x0D)
    var binaryBytes = [
      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x0E, 0x0F,
      0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
    ];
    // negative - char with main bytes NOT between 0x01 and 0x19 (inclusive),
    //            EXCEPT for whitespace bytes (0x09, 0x0A, 0x0B, 0x0C, 0x0D)
    var nonBinaryBytes = [0x00, 0x09, 0x0A, 0x0B, 0x0C, 0x0D];
    for (var min = 0x20, max = 0xFF; min <= max; min += 0x01) {
      nonBinaryBytes.push(min);
    }

    var getErrorMsg = function(bom, oneByte, byteSequence) {
      return 'BOM was: ' + bom + '\n' +
             'byte was: ' + encodingHelper.asOctet(oneByte) + '\n' +
             'byteSequence was: ' + JSON.stringify(byteSequence.map(function(b) { return encodingHelper.asOctet(b); }));
    };

    // 1536 === `boms.length * (binaryBytes.length + nonBinaryBytes.length)`
    test.expect(1536);

    boms.forEach(function(bom) {
      // Run positive tests
      binaryBytes.forEach(function(oneByte) {
        var byteSequence = encodingHelper.charFromByte(oneByte, bom);
        test.equal(encoder.doesByteSequenceSuggestBinary(byteSequence, bom), true, getErrorMsg(bom, oneByte, byteSequence));
      });

      // Run negative tests
      nonBinaryBytes.forEach(function(oneByte) {
        var byteSequence = encodingHelper.charFromByte(oneByte, bom);
        test.equal(encoder.doesByteSequenceSuggestBinary(byteSequence, bom), false, getErrorMsg(bom, oneByte, byteSequence));
      });
    });

    test.done();
  }
};
