'use strict';

// Built-in modules
var os = require('os');
var fs = require('fs');
var path = require('path');

// External modules
var fsExtra = require('fs-extra');

// Internal modules
var dos2unix = require('../lib/dos2unix');


// Convert a Buffer into a ByteArray
var toByteArray = (function() {
  var slicer = Array.prototype.slice;
  return function(buffer) {
    return slicer.call(buffer, 0, buffer.length);
  };
})();


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
    // Change the CWD to: {repo}/test/
    process.chdir(testDir);
    
    // Finish `setUp`
    done();
  },
  
  tearDown: function(done) {
    // Revert the CWD
    process.chdir(_cwd);

    // Finish `tearDown`
    done();
  },
  
  'Binary - skip file': function(test) {
    test.expect(17);

    var testFileName = 'binary.swf';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);
    
    var eventOrder = 0;
    var expectedResults = {
      'error': 0,
      'skip': 1,
      'fix': 0
    };

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      var d2u = new dos2unix(testOptions)
        .on('start', function() {
          test.strictEqual(eventOrder++, 0, 'Step was not called in the expected order: "start"');
        })
        .on('processing.start', function(data) {
          test.strictEqual(eventOrder++, 1, 'Step was not called in the expected order: "processing.start"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('processing.skip', function(data) {
          test.strictEqual(eventOrder++, 2, 'Step was not called in the expected order: "processing.skip"');
          test.ok(data, 'Received a data object');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
          test.strictEqual(data.message, 'Skipping suspected binary file', 'Message did not match expected');
          test.strictEqual(Object.keys(data).length, 2, 'data object does not contain unexpected properties');

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
        })
        .on('convert.start', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('convert.error', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('convert.end', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('processing.error', function(data) {
          // Should not get here
          test.ok(false, 'There was an unexpected conversion error: ' + JSON.stringify(data));
        })
        .on('processing.end', function(data) {
          test.strictEqual(eventOrder++, 3, 'Step was not called in the expected order: "processing.end"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('error', function(err) {
          // Should not get here
          console.error(err);
          test.ok(false, 'Error converting file from dos2unix: ' + err);
          test.done();
        })
        .on('end', function(data) {
          test.strictEqual(eventOrder++, 4, 'Step was not called in the expected order: "end"');
          test.deepEqual(data, expectedResults, 'Final processing results did not match the expected');
          test.done();
        });
      d2u.process([testFileName]);
    });
  },
  
  'UNIX - skip file': function(test) {
    test.expect(17);
    
    var testFileName = 'unix.sh';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);
    
    var eventOrder = 0;
    var expectedResults = {
      'error': 0,
      'skip': 1,
      'fix': 0
    };

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      var d2u = new dos2unix(testOptions)
        .on('start', function() {
          test.strictEqual(eventOrder++, 0, 'Step was not called in the expected order: "start"');
        })
        .on('processing.start', function(data) {
          test.strictEqual(eventOrder++, 1, 'Step was not called in the expected order: "processing.start"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('processing.skip', function(data) {
          test.strictEqual(eventOrder++, 2, 'Step was not called in the expected order: "processing.skip"');
          test.ok(data, 'Received a data object');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
          test.strictEqual(data.message, 'Skipping file with all correct line endings', 'Message did not match expected');
          test.strictEqual(Object.keys(data).length, 2, 'data object does not contain unexpected properties');

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
        })
        .on('convert.start', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('convert.error', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('convert.end', function(data) {
          // Should not get here
          test.ok(false, 'File was not skipped but should have been: ' + JSON.stringify(data));
        })
        .on('processing.error', function(data) {
          // Should not get here
          test.ok(false, 'There was an unexpected conversion error: ' + JSON.stringify(data));
        })
        .on('processing.end', function(data) {
          test.strictEqual(eventOrder++, 3, 'Step was not called in the expected order: "processing.end"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('error', function(err) {
          // Should not get here
          console.error(err);
          test.ok(false, 'Error converting file from dos2unix: ' + err);
          test.done();
        })
        .on('end', function(data) {
          test.strictEqual(eventOrder++, 4, 'Step was not called in the expected order: "end"');
          test.deepEqual(data, expectedResults, 'Final processing results did not match the expected');
          test.done();
        });
      d2u.process([testFileName]);
    });
  },
  
  'DOS - convert file to UNIX': function(test) {
    test.expect(24);

    var testFileName = 'dos.sh';
    var origPath = path.resolve(fixturesDir + testFileName);
    var fullTempPath = path.resolve(tmpDir + testFileName);
    var expectedPath = path.resolve(expectedDir + testFileName);

    var eventOrder = 0;
    var expectedResults = {
      'error': 0,
      'skip': 0,
      'fix': 1
    };

    fsExtra.copy(origPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');

      var d2u = new dos2unix(testOptions)
        .on('start', function() {
          test.strictEqual(eventOrder++, 0, 'Step was not called in the expected order: "start"');
        })
        .on('processing.start', function(data) {
          test.strictEqual(eventOrder++, 1, 'Step was not called in the expected order: "processing.start"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('processing.skip', function(data) {
          // Should not get here
          test.ok(false, 'File was skipped but should not have been: ' + JSON.stringify(data));
        })
        .on('convert.start', function(data) {
          test.strictEqual(eventOrder++, 2, 'Step was not called in the expected order: "convert.start"');
          test.ok(data, 'Received a data object');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('convert.error', function(data) {
          // Should not get here
          test.ok(false, 'File conversion unexpectedly failed: ' + JSON.stringify(data));
        })
        .on('convert.end', function(data) {
          test.strictEqual(eventOrder++, 3, 'Step was not called in the expected order: "convert.end"');
          test.ok(data, 'Received a data object');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
          test.strictEqual(Object.keys(data).length, 1, 'data object does not contain unexpected properties');

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
        })
        .on('processing.error', function(data) {
          // Should not get here
          test.ok(false, 'There was an unexpected conversion error: ' + JSON.stringify(data));
        })
        .on('processing.end', function(data) {
          test.strictEqual(eventOrder++, 4, 'Step was not called in the expected order: "processing.end"');
          test.strictEqual(data.file, fullTempPath, 'File path did not match expected');
        })
        .on('error', function(err) {
          // Should not get here
          console.error(err);
          test.ok(false, 'Error converting file from dos2unix: ' + err);
          test.done();
        })
        .on('end', function(data) {
          test.strictEqual(eventOrder++, 5, 'Step was not called in the expected order: "end"');
          test.deepEqual(data, expectedResults, 'Final processing results did not match the expected');
          test.done();
        });
      d2u.process([testFileName]);
    });
  }

};
