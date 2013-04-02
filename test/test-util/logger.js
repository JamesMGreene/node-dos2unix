'use strict';

module.exports = function Logger() {
  if (!(this instanceof Logger)) {
    return new Logger();
  }

  var logs = [];
  var slicer = Array.prototype.slice;

  this.write = function() {
    logs.push(slicer.call(arguments, 0).join(' '));
  };
  this.flush = function() {
    return logs.splice(0, logs.length);
  };
};