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

function asOctet(oneByte) {
  return '0x' + oneByte.toString(16).toUpperCase();
}

module.exports = {
  charFromByte: charFromByte,
  asOctet: asOctet
};