[![Build Status](https://travis-ci.org/JamesMGreene/node-dos2unix.png)](https://travis-ci.org/JamesMGreene/node-dos2unix)

# dos2unix

A Node.js module to convert text files with DOS line breaks to Unix line breaks, i.e. like using [`dos2unix`][dos2unix].
The module also supports cross-platform globbing patterns.

## Getting Started
Install the module with: `npm install dos2unix`

```js
var dos2unix = require('dos2unix').dos2unix;
dos2unix(['docs/README.txt'], function(err) {
  // Callback!
});
```

## Examples
```js
// Reference the module
var converter = require('dos2unix');

// A callback function
var d2uCallback = function(err) {
  // Callback!
};

// Convert line endings of a single non-binary, non-irregular file from
// '\r\n' to '\n'.
converter.dos2unix(['docs/README.txt'], d2uCallback);

// Convert the line endings of multiple non-binary, non-irregular files from
// '\r\n' to '\n'.
converter.dos2unix(['docs/README.txt', 'examples/HelloWorld.js'], d2uCallback);

// Convert the line endings of all non-binary and non-irregular files in the
// 'docs' directory (non-recursively) from '\r\n' to '\n'.
converter.dos2unix(['docs/*'], d2uCallback);

// Convert the line endings of all non-binary and non-irregular files under the
// 'examples' directory (RECURSIVELY) from '\r\n' to '\n'.
converter.dos2unix(['examples/**/*'], d2uCallback);

// Convert the line endings of all non-binary and non-irregular files in the
// 'docs' directory (non-recursively) AND the same type of files under the
// 'examples' directory (RECURSIVELY) from '\r\n' to '\n'.
converter.dos2unix(['docs/*', 'examples/**/*'], d2uCallback);

// Override the globbing options (per the `glob` module's documentation)
var globOptions = {
  glob: {
    cwd: 'docs'
  }
};
converter.dos2unix(['*.txt'], globOptions, d2uCallback);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests
for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 0.3.0: Published to NPM on 2013-04-03.
    - Hardened the unit tests, which led to exposing and fixing a critical bug in the `dos2unix`
      conversion implementation.
 - 0.2.2: Published to NPM on 2013-04-02.
    - Changed tests to write to the OS tmpdir instead of local to the repo, hopefully this fixes
      the Travis-CI build.
    - Also patched a globbing issue where all paths were relative to the CWD even if the `glob`
      command was executed relative to a different directory.
 - 0.2.1: Published to NPM on 2013-04-02.
    - README fixes.
 - 0.2.0: Published to NPM on 2013-04-02.
    - Initial release.

## License
Copyright (c) 2013 James M. Greene  
Licensed under the MIT license.



[dos2unix]: http://sourceforge.net/projects/dos2unix/?source=dlp "dos2unix site"