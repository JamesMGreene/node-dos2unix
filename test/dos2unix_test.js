'use strict';

// Built-in modules
var fs = require('fs');

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


// Delete the temporary test data folder
fsExtra.removeSync('fixtures/tmp');

// Create a temporary test data folder
fsExtra.mkdirsSync('fixtures/tmp');

    
exports['dos2unix'] = {

  setUp: function(done) {
    // Redirect the console methods to buffering loggers for testing purposes
    //console.log = logLogger.write;
    //console.error = errorLogger.write;

    // Change the CWD to: {repo}/test/
    process.chdir(__dirname);
    
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
    var testFilePath = 'fixtures/tmp/binary.swf';
    fsExtra.copy('fixtures/dos2unix/binary.swf', testFilePath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(testFilePath), 'Copied file does not exist');
      dos2unix([testFilePath], null, done);
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
    var testFilePath = 'fixtures/tmp/unix.sh';
    fsExtra.copy('fixtures/dos2unix/unix.sh', testFilePath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(testFilePath), 'Copied file does not exist');
      dos2unix([testFilePath], null, done);
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
    var testFilePath = 'fixtures/tmp/dos.sh';
    fsExtra.copy('fixtures/dos2unix/dos.sh', testFilePath, function(err) {
      test.ok(!err, 'Error copying test file');
      test.ok(fs.existsSync(testFilePath), 'Copied file does not exist');
      dos2unix([testFilePath], null, done);
    });
  }

};
