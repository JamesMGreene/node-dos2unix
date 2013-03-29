'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
      }
    },
    nodeunit: {
      all: ['test/**/*_test.js']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);
  // TravisCI task.
  grunt.registerTask('travis', ['jshint', 'nodeunit']);

};
