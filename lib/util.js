/**
 * @fileoverview Utilities file holding help methods.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var cli = require('./cli');

module.exports = {
    /**
     * Create a WebPageTest options object from input arguments.
     * @param {array} argv The arguments for the run
     * @return {object} the WebPageTest options object
     */
    setupWPTOptions: function(argv) {

        var wptOptions = {
            pollResults: 10,
            timeout: 1200,
            video: 'true',
            label: argv.label ? this.getTodaysDate() + '-' + argv.label : this.getTodaysDate(),
            runs: 11
        };

        Object.keys(argv).forEach(function(param) {
            if (['webPageTestKey', 'webPageTestHost', '_', 'verbose',
                    'customMetrics', 'namespace', 'batch', 'label', 'endpoint',
                    'reporter'
                ].indexOf(param) === -1) {
                wptOptions[param] = argv[param];
            }
        });

        return wptOptions;
    },
    /**
     * Convert an input text line from a file to a minimist created argument object
     * @param {string} line The text line
     * @return {object} a minimist argument object
     */
    convertTextLineToMinimist: function(line) {
        // replace variables with env variables
        line = this.replaceWithEnv(line);
        // the location element for WebPageTest has a couple of different
        // variants: http://www.webpagetest.org/getLocations.php
        // most problem for us is the space that sometimes is in the name
        // so for now: remove location before parse and then add it again

        var location = '';
        var locationLine = line.match(/--location(.*?)(?=\s--)/g);
        if (locationLine) {
            line = line.split(locationLine[0] + ' ').join('');
            location = locationLine[0].replace('--location ', '');
        }
        var myArgs = cli.getMinimistArgv(line.split(' '));

        // insert the location again
        if (locationLine) {
            myArgs.location = location;
        }
        return myArgs;
    },
    /**
     * Read a text file (utf-8) and retunr the content.
     * @param {string} filename The file and path to the file to read
     * @return {string} the text file
     */
    readFile: function(filename) {
        var fullPathToFile = (filename.charAt(0) === path.sep) ? filename : path.join(process.cwd(),
            path.sep, filename);
        return fs.readFileSync(fullPathToFile, 'utf-8');
    },
    /**
     * Get the file content or the URL for a run. The webpagetest api takes either
     * a URL or a file with URLs.
     * @param {string} arg The argument to checkif it's a URL or file.
     * @param {string} the URL or content of the file
     */
    getInputURLorFile: function(arg) {
        // is it a file or URL we wanna test?
        if (arg.indexOf('http') === -1) {
            var fileContent = this.readFile(arg);
            return this.replaceWithEnv(fileContent);
        } else {
            return arg;
        }
    },
    /**
     * Replace all occurrences placeholders matching <%YOUR_KEY>
     * with a matching named environment variable. Log error if we
     * have placeholders but no matching variables.
     * @param {string} text The text to replae
     * @return {string} the text with replaced placeholders
     */
    replaceWithEnv: function(text) {
        var matches = text.match(/<(.*?)>/g);
        if (matches) {
            matches.forEach(function(match) {
                // do we have a matching ENV?
                var env = match.substring(2, match.length - 1);
                if (process.env[env]) {
                    text = text.replace(match, process.env[env]);
                } else {
                    console.error('No ENV set for ' + env + ' the expr ' + match +
                        ' will not be replaced');
                }

            });
        }
        return text;
    },
    /**
     * Get the current date and time in UTC.
     * @return {string} the time with the format YYYY-MM-DD HH.MM
     */
    getTodaysDate: function() {

        function addPadding(number) {
            number = number.toString();
            if (number.length === 1) {
                return '0' + number;
            }
            return number;
        }

        var date = new Date();
        var month = addPadding(date.getUTCMonth() + 1);
        var day = addPadding(date.getUTCDate());
        var hours = addPadding(date.getUTCHours());
        var minutes = addPadding(date.getUTCMinutes());

        return date.getUTCFullYear() + '-' + month + '-' + day + ' ' + hours + '.' + minutes;
    }
};
