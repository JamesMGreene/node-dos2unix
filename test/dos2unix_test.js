'use strict';

// External modules
var fsExtra = require('fs-extra');

// Internal modules
var dos2unix = require('../lib/index').dos2unix;
var Logger = require('./util/logger');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var consoleMethods = {
  log: console.log,
  error: console.error
};

var logLogger = new Logger();
var errorLogger = new Logger();

exports['dos2unix'] = {
  setUp: function(done) {
    // setup here
    console.log = logLogger.write;
    console.error = errorLogger.write;
    
    fsExtra.mkdirs('fixtures/tmp', function(err) {
      if (err) {
        throw err;
      }
      done();
    });
  },
  tearDown: function(done) {
    // teardown here
    console.log = consoleMethods.log;
    console.error = consoleMethods.error;
    
    fsExtra.remove('fixtures/tmp', function(err) {
      if (err) {
        throw err;
      }
      done();
    });
  },
  'binary': function(test) {
    test.expect(2);
    
    // tests here
    var done = function(err) {
      consoleMethods.log('\nBinary stdout: ' + logLogger.flush().join('\n'));
      consoleMethods.error('\nBinary stderr: ' + errorLogger.flush().join('\n'));
      test.ok(!err);
      test.done();
    };
    var testFilePath = 'fixtures/tmp/binary.swf';
    var opts = {
      glob: {
        cwd: __dirname
      }
    };
    fsExtra.copy('fixtures/binary.swf', testFilePath, function(err) {
      test.ok(!err);
      dos2unix([testFilePath], opts, done);
    });
  },
  'good': function(test) {
    test.expect(2);
    
    // tests here
    var done = function(err) {
      consoleMethods.log('\nGood stdout: ' + logLogger.flush().join('\n'));
      consoleMethods.error('\nGood stderr: ' + errorLogger.flush().join('\n'));
      test.ok(!err);
      test.done();
    };
    var testFilePath = 'fixtures/tmp/good.sh';
    var opts = {
      glob: {
        cwd: __dirname
      }
    };
    fsExtra.copy('fixtures/good.sh', testFilePath, function(err) {
      test.ok(!err);
      dos2unix([testFilePath], opts, done);
    });
  },
  'bad': function(test) {
    test.expect(2);
    
    // tests here
    var done = function(err) {
      consoleMethods.log('\nBad stdout: ' + logLogger.flush().join('\n'));
      consoleMethods.error('\nBad stderr: ' + errorLogger.flush().join('\n'));
      test.ok(!err);
      test.done();
    };
    var testFilePath = 'fixtures/tmp/bad.sh';
    var opts = {
      glob: {
        cwd: __dirname
      }
    };
    fsExtra.copy('fixtures/bad.sh', testFilePath, function(err) {
      test.ok(!err);
      dos2unix([testFilePath], opts, done);
    });
  }
};
