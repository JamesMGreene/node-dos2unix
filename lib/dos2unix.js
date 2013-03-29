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

// External modules
var Q = require('q');
var BinaryReader = require('buffered-reader').BinaryReader;

// Internal modules
var common = require('./common');

function determineProcessingStatus(filePath, done) {
  common.detectBom(filePath, function(err, bom) {
    var status = 'good';
    var needsFixing = false;
    var lastByteSequenceWasCR = false;
    var bytesPerBom = common.getBytesPerBom(bom);
    var bytesPerControlChar = common.getBytesPerControlChar(bom);

    var reader = new BinaryReader(filePath);

    var readCallback = function(err, buffer, bytesRead) {
      if (err) {
        status = 'error';
        console.error('Error while processing "' + filePath + '": ' + (err.stack || err));
        return done(null, status);
      }
      else if (bytesRead === bytesPerControlChar) {
        if (common.doesByteSequenceSuggestBinary(buffer, bom)) {
          status = 'binary';
          return done(null, status);
        }
        else if (common.isByteSequenceCR(buffer, bom)) {
          lastByteSequenceWasCR = true;
        }
        else {
          if (lastByteSequenceWasCR && common.isByteSequenceLF(buffer, bom)) {
            needsFixing = true;
          }
          lastByteSequenceWasCR = false;
        }
        // else continue
        
        // Check for EOF
        if (reader.isOffsetOutOfWindow()) {
          if (status === 'good' && needsFixing) {
            status = 'bad';
          }
          // Close the file
          reader.close(function(errClosing) {
            if (errClosing) {
              console.error('Error while closing "' + filePath + '": ' + (errClosing.stack || errClosing));
            }
            return done(null, status);
          });
        }
        else {
          process.nextTick(function() {
            reader.read(bytesPerControlChar, readCallback);
          });
        }
      }
      else {
        status = 'error';
        console.error('Error while processing "' + filePath + '": did not read expected number of bytes');
        return done(null, status);
      }
    };
    
    // Fast-forward past the BOM if present
    if (bytesPerBom > 0) {
      reader.read(bytesPerBom, function(err, buffer, bytesRead) {
        if (err) {
          console.error('Error while processing "' + filePath + '": ' + (err.stack || err));
          status = 'error';
          return done(null, status);
        }
        else if (bytesRead < bytesPerBom) {
          console.error('Error while processing "' + filePath + '": Unable to read past the expected BOM');
          status = 'error';
          return done(null, status);
        }
        reader.read(bytesPerControlChar, readCallback);
      });
    }
    else {
      reader.read(bytesPerControlChar, readCallback);
    }
  });
}

function convertDosToUnix(filePath, done) {
  fs.readFile(filePath, function(err, buffer) {
    if (err) {
      console.error('Error while reading file "' + filePath + '": ' + (err.stack || err));
    }
    else {
      var outFile = fs.createWriteStream(filePath);
      outFile.on('error', function(err) {
        console.error('Error while writing file "' + filePath + '": ' + (err.stack || err));
        return done(err);
      });
      
      var bom = common.determineBomFromBuffer(buffer.slice(0, 4));
      var bytesPerBom = common.getBytesPerBom(bom);
      var bytesPerControlChar = common.getBytesPerControlChar(bom);
      var lastByteSequenceWasCR = false;
      var lastWriteIndex = 0;
      var byteSequence;
      
      for (var b = bytesPerBom, len = buffer.length; b < len; b += bytesPerControlChar) {
        byteSequence = buffer.slice(b, b + bytesPerControlChar);
        if (common.isByteSequenceCR(byteSequence)) {
          lastByteSequenceWasCR = true;
        }
        else {
          if (lastByteSequenceWasCR && common.isByteSequenceLF(byteSequence, bom)) {
            // Write everything read since the last write up to the CR (but omit the CR)
            outFile.write(buffer.slice(lastWriteIndex, b - bytesPerControlChar));
            // The next write will start with including this LF
            lastWriteIndex = b + bytesPerControlChar;
          }
          // Else if at end of buffer, finalize the file rewrite
          else if (b + bytesPerControlChar === len) {
            outFile.end(buffer.slice(lastWriteIndex, b + bytesPerControlChar));
            outFile.destroySoon();
            console.log('Successfuly rewrote file "' + filePath + '"');
            done(null);
          }
          lastByteSequenceWasCR = false;
        }
      }
    }
  });
}


// Promise bindings
var resolveGlobAsyncP = Q.nfbind(common.resolveGlobAsync);
var determineProcessingStatusP = Q.nfbind(determineProcessingStatus);
var convertDosToUnixP = Q.nfbind(convertDosToUnix);

// Important method!
function dos2unix(patterns, options, done) {
  // Validate input
  if (typeof options === 'function' && done == null) {
    done = options;
    options = null;
  }
  done = common.validateDone(done);
  options = common.validateOptions(options, done);
  var validPatterns = common.validatePatterns(patterns, done);

  // Find the pertinent files from the glob, sorted and without duplicates
  resolveGlobAsyncP(validPatterns, options.glob)
  .then(function(fileList) {
    // Figure out which files are binary
    return Q.allResolved(
      fileList.map(function(filePath) {
        return determineProcessingStatusP(filePath);
      })
    ).then(function(safetyList) {
      return fileList.map(function(filePath, i) {
        return { path: filePath, status: safetyList[i] };
      });
    });
  }).then(function(fileListWithSafetyInfo) {
    // Filter out the binary files
    return fileListWithSafetyInfo.filter(function(fileInfo) {
      if (fileInfo.status === 'error') {
        console.error('Skipping file with errors during read: ' + fileInfo.path);
      }
      else if (fileInfo.status === 'binary') {
        console.log('Skipping suspected binary file: ' + fileInfo.path);
      }
      else if (fileInfo.status === 'good') {
        console.log('Skipping file that does not need fixing: ' + fileInfo.path);
      }
      return fileInfo.status === 'bad';
    }).map(function(needsFixingFileInfo) {
      return needsFixingFileInfo.path;
    });
  }).then(function(needsFixingFileList) {
    // Process the safe files
    var messageStart = 'Converting line endings from "\\r\\n" to "\\n" in file: ';
    return Q.allResolved(
      needsFixingFileList.map(function(filePath) {
        console.log.push(messageStart + filePath);
        return convertDosToUnixP(filePath);
      })
    );
  })
  .then(done)
  .fail(done)
  .done();
}

// Exports
module.exports = dos2unix;