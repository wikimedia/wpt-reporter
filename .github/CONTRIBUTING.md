# Contributing to WPT-reporter

Thank you for helping us making WPT-reporter better!

This document describes how to report bugs, set up your development
environment and run tests.

## Bug reports

Please report bugs to [phabricator.wikimedia.org](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?projects=WebPageTest)
using the `WebPageTest` project.

## Running tests

To install make sure you have [node and npm](https://nodejs.org/)
installed, then run:

```sh
# Install dependencies
$ npm install
```

To run the tests, use:
```sh
$ npm test
```

## Source code in Gerrit
The canonical repository for wpt-reporter is hosted in Gerrit (as "performance/WebPageTest.git"). Checkout https://www.mediawiki.org/wiki/Developer_access to get access and submit your changes.
