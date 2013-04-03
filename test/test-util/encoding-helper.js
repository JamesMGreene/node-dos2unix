'use strict';

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


module.exports = {
  charFromByte: charFromByte,
  asOctet: asOctet
};