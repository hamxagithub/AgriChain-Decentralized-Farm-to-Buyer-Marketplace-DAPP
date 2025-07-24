import 'react-native-crypto';
import 'react-native-randombytes';

// Global polyfills for crypto functionality
if (typeof global.crypto === 'undefined') {
  global.crypto = require('react-native-crypto');
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('@craftzdog/react-native-buffer').Buffer;
}

// Polyfill for streams
if (typeof global.stream === 'undefined') {
  global.stream = require('stream-browserify');
}
