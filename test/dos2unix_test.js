'use strict';

// Built-in modules
var fs = require('fs');
var os = require('os');

// External modules
var fsExtra = require('fs-extra');

// Internal modules
var dos2unix = require('../index').dos2unix;
var Logger = require('./test-util/logger');

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
    //console.log = logLogger.write;
    //console.error = errorLogger.write;

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
    test.expect(3);
    
    var done = function(err) {
      _console.log('\nBinary stdout: ' + logLogger.flush().join('\n'));
      _console.error('\nBinary stderr: ' + errorLogger.flush().join('\n'));
      if (err) {
        _console.error(err.stack || err);
      }
      test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
      test.done();
    };
    var testFileName = 'binary.swf';
    var relativeOrigPath = fixturesDir + testFileName;
    var fullTempPath = tmpDir + testFileName;
    fsExtra.copy(relativeOrigPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');
      dos2unix([testFileName], testOptions, done);
    });
  },
  
  'UNIX - skip file': function(test) {
    test.expect(3);
    
    var done = function(err) {
      _console.log('\nGood stdout: ' + logLogger.flush().join('\n'));
      _console.error('\nGood stderr: ' + errorLogger.flush().join('\n'));
      if (err) {
        _console.error(err.stack || err);
      }
      test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
      test.done();
    };
    var testFileName = 'unix.sh';
    var relativeOrigPath = fixturesDir + testFileName;
    var fullTempPath = tmpDir + testFileName;
    fsExtra.copy(relativeOrigPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');
      dos2unix([testFileName], testOptions, done);
    });
  },
  
  'DOS - convert file to UNIX': function(test) {
    test.expect(3);
    
    var done = function(err) {
      _console.log('\nBad stdout: ' + logLogger.flush().join('\n'));
      _console.error('\nBad stderr: ' + errorLogger.flush().join('\n'));
      if (err) {
        _console.error(err.stack || err);
      }
      test.ok(!err, 'Error converting file from dos2unix: ' + ((err && err.stack) || null));
      test.done();
    };
    var testFileName = 'dos.sh';
    var relativeOrigPath = fixturesDir + testFileName;
    var fullTempPath = tmpDir + testFileName;
    fsExtra.copy(relativeOrigPath, fullTempPath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(fullTempPath), 'Copied file does not exist');
      dos2unix([testFileName], testOptions, done);
    });
  }

};
