'use strict';

// Built-in modules
var os = require('os');
var fs = require('fs');
var path = require('path');

// External modules
var fsExtra = require('fs-extra');

// Internal modules
var dos2unix = require('../index').dos2unix;
var Logger = require('./test-util/logger');


// Convert a Buffer into a ByteArray
var toByteArray = (function() {
  var slicer = Array.prototype.slice;
  return function(buffer) {
    return slicer.call(buffer, 0, buffer.length);
  };
})();

// Override the `console.log` and `console.error` methods
var _console = {
  log: console.log,
  error: console.error
};
var logLogger = new Logger();
var errorLogger = new Logger();

process.on('uncaughtException', function(err) {
  console.error('Uncaught exception: ' + (err.stack || err));
});

var _cwd = process.cwd();
var testDir = __dirname;
var tmpDir = (os.tmpdir || os.tmpDir)() + '/dos2unix_test/';
// Dir of pertintent fixtures, relative to `testDir`
var fixturesDir = 'fixtures/dos2unix/';
var expectedDir = 'expected/dos2unix/';

var testOptions = {
  glob: {
    cwd: tmpDir
  }
};


// Delete the temporary test data folder
fsExtra.removeSync(tmpDir);

// Create a temporary test data folder
fsExtra.mkdirsSync(tmpDir);

    
exports['dos2unix'] = {

  setUp: function(done) {
    // Redirect the console methods to buffering loggers for testing purposes
    console.log = logLogger.write;
    console.error = errorLogger.write;

    // Change the CWD to: {repo}/test/
    process.chdir(testDir);
    
    // Finish `setUp`
    done();
  },
  
  tearDown: function(done) {
    // teardown here
    console.log = _console.log;
    console.error = _console.error;

    // Revert the CWD
    process.chdir(_cwd);

    // Finish `tearDown`
    done();
  },
  
  'Binary - skip file': function(test) {
    test.expect(8);

    var testFileName = 'binary.swf';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);

    var expectedStdOut = ['Skipping suspected binary file: ' + path.normalize(fullTempPath)];
    var expectedStdErr = [];

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      dos2unix([testFileName], testOptions, function(err) {
        if (err) {
          _console.error(err.stack || err);
        }
        test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
        test.deepEqual(logLogger.flush(), expectedStdOut, '`console.log` output did not match expected');
        test.deepEqual(errorLogger.flush(), expectedStdErr, '`console.error` output did not match expected');

        // Actually verify file was NOT modified
        var actualByteArr = toByteArray(fs.readFileSync(fullTempPath));
        test.ok(actualByteArr.length > 0, 'File contents should not be empty.');
        test.deepEqual(
          actualByteArr,
          toByteArray(fs.readFileSync(origPath)),
          'File contents should be unmodified from the original state.'
        );
        test.deepEqual(
          actualByteArr,
          toByteArray(fs.readFileSync(expectedPath)),
          'File contents should match the expected file contents.'
        );

        test.done();
      });
    });
  },
  
  'UNIX - skip file': function(test) {
    test.expect(8);
    
    var testFileName = 'unix.sh';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);

    var expectedStdOut = ['Skipping file that does not need fixing: ' + path.normalize(fullTempPath)];
    var expectedStdErr = [];

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      dos2unix([testFileName], testOptions, function(err) {
        if (err) {
          _console.error(err.stack || err);
        }
        test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
        test.deepEqual(logLogger.flush(), expectedStdOut, '`console.log` output did not match expected');
        test.deepEqual(errorLogger.flush(), expectedStdErr, '`console.error` output did not match expected');

        // Actually verify file was NOT modified
        var actualByteArr = toByteArray(fs.readFileSync(fullTempPath));
        test.ok(actualByteArr.length > 0, 'File contents should not be empty.');
        test.deepEqual(
          actualByteArr,
          toByteArray(fs.readFileSync(origPath)),
          'File contents should be unmodified from the original state.'
        );
        test.deepEqual(
          actualByteArr,
          toByteArray(fs.readFileSync(expectedPath)),
          'File contents should match the expected file contents.'
        );

        test.done();
      });
    });
  },
  
  'DOS - convert file to UNIX': function(test) {
    test.expect(13);

    var testFileName = 'dos.sh';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);

    var expectedStdOut = [
      'File needs fixing: ' + fullTempPath,
      'Converting line endings from "\\r\\n" to "\\n" in file: ' + fullTempPath,
      'Successfully rewrote file: ' + fullTempPath
    ];
    var expectedStdErr = [];

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      dos2unix([testFileName], testOptions, function(err) {
        if (err) {
          _console.error(err.stack || err);
        }
        test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
        test.deepEqual(logLogger.flush(), expectedStdOut, '`console.log` output did not match expected');
        test.deepEqual(errorLogger.flush(), expectedStdErr, '`console.error` output did not match expected');

        var actualBuffer = fs.readFileSync(fullTempPath);
        var actualByteArr = toByteArray(actualBuffer);
        var expectedByteArr = toByteArray(fs.readFileSync(expectedPath));
        var originalByteArr = toByteArray(fs.readFileSync(origPath));
        var originalByteArrMinusCRs = originalByteArr.filter(function(b) {
          // Same as `originalByteArr` except for having all carriage returns removed
          return b !== 0x0D;
        });

        // Actually verify file WAS modified correctly
        test.ok(actualBuffer.length > 0, 'File contents (buffer) should not be empty.');
        test.ok(actualByteArr.length > 0, 'File contents (byte array) should not be empty.');
        test.strictEqual(actualByteArr.indexOf(0x0D), -1, 'File contents should not contain carriage returns.');
        test.notStrictEqual(actualByteArr.indexOf(0x0A), -1, 'File contents should still contain line feeds.');
        test.notDeepEqual(actualByteArr, originalByteArr, 'File contents should be modified from the original state.');
        test.ok(originalByteArrMinusCRs.length < originalByteArr.length, 'File contents should contain less bytes than the original.');
        test.deepEqual(expectedByteArr, originalByteArrMinusCRs, 'Expected file contents should be the same as the original but minus carriage returns.');
        test.deepEqual(actualByteArr, expectedByteArr, 'File contents should match the expected file contents.');

        test.done();
      });
    });
  }

};
