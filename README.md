[![Build Status](https://travis-ci.org/JamesMGreene/node-dos2unix.png?branch=master)](https://travis-ci.org/JamesMGreene/node-dos2unix)

# dos2unix

A Node.js module to convert text files with DOS line breaks to Unix line breaks, i.e. like using [`dos2unix`][dos2unix].
The module also supports cross-platform globbing patterns.

## Getting Started
Install the module with: `npm install dos2unix`

```js
var D2UConverter = require('dos2unix').dos2unix;
var d2u = new D2UConverter({ glob: { cwd: __dirname } })
  .on('error', function(err) {
    console.error(err);
  })
  .on('end', function(stats) {
    console.log(stats);
  });
d2u.process(['docs/*']);
```

## Examples
```js
// Reference the module
var D2UConverter = new require('dos2unix').dos2unix;

// Setup default options
var defaultOptions = {
  glob: {
    cwd: __dirname
  },
  maxConcurrency: 50
};

// Create a new `dos2unix` instance and add important event listeners
var d2u = new D2UConverter(defaultOptions)
  .on('error', function(err) {
    console.error(err);
  })
  .on('end', function(stats) {
    console.log(stats);
  });

// Convert line endings of a single non-binary, non-irregular file from
// '\r\n' to '\n'.
d2u.process(['docs/README.txt']);

// Convert the line endings of multiple non-binary, non-irregular files from
// '\r\n' to '\n'.
d2u.process(['docs/README.txt', 'examples/HelloWorld.js']);

// Convert the line endings of all non-binary and non-irregular files in the
// 'docs' directory (non-recursively) from '\r\n' to '\n'.
d2u.process(['docs/*']);

// Convert the line endings of all non-binary and non-irregular files under the
// 'examples' directory (RECURSIVELY) from '\r\n' to '\n'.
d2u.process(['examples/**/*']);

// Convert the line endings of all non-binary and non-irregular files in the
// 'docs' directory (non-recursively) AND the same type of files under the
// 'examples' directory (RECURSIVELY) from '\r\n' to '\n'.
d2u.process(['docs/*', 'examples/**/*']);

// Override the globbing options (per the `glob` module's documentation)
var globOptions = {
  glob: {
    cwd: 'docs'
  }
};
d2u.process(['*.txt'], globOptions);
```

## Events
 - `start`
 - `processing.start`
 - `processing.skip`
 - `convert.start`
 - `convert.error` / `convert.end`
 - `processing.error` / `processing.end`
 - `error` / `end`

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests
for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 1.1.1: Published to NPM on 2013-05-31.
    - Set the `maxConcurrency` config default value to `0` ("unlimited"). Also updated a little code
      so that a `maxConcurrency` config value of `0` or less will result in "unlimited", i.e. process
      the whole array of globbed files at once.
 - 1.1.0: Published to NPM on 2013-05-31.
    - Added the `maxConcurrency` config options to throttle how many files can be processed
      simultaneously. This helps avoid issues across the board as most systems have an implicit
      number of file handles that can be opened as once. It also provides those running on
      hardware with limited resources to maintain better control of consumption.
    - Under the covers: swapped in the `async` module to replace `q`, particularly for its
      `parallelLimit` function.
 - 1.0.2: Published to NPM on 2013-05-25.
    - Now omitting directories from the glob results as trying to convert their non-existent line
      endings throws errors.
 - 1.0.1: Published to NPM on 2013-05-01.
    - Converted 1 stray `console.error` call to an event emission as intended.
 - 1.0.0: Published to NPM on 2013-05-01.
    - Completely remade: redid the whole API to be an EventEmitter, gutted the implementation, etc.
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