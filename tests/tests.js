//- JavaScript source code

//- tests.js ~~
//
//  I wrote these tests for use with PhantomJS because I am sick of typing them
//  out over and over in the Chrome console. It's close enough to using Node.js
//  that I lied to JSLint about it, hehe.
//
//  Coming soon: tests that check the JSON return types of API calls.
//
//  NOTE: See https://github.com/ariya/phantomjs/issues/12697 if tests are
//  failing right now ...
//
//                                                      ~~ (c) SRW, 28 Nov 2012
//                                                  ~~ last updated 03 Feb 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        args, avar, box, click, close, create, error, evaluate, exit, f,
        hasOwnProperty, key, length, log, map, mapreduce, on, onConsoleMessage,
        onError, onResourceReceived, onResourceRequested, open, push, Q, QM,
        reduce, slice, start, stringify, submit, val, x, y
    */

 // Declarations

    var exit, mothership, n, queue, register_test, submit, volunteer;

 // Definitions

    exit = function (code) {
     // This function needs documentation.
        /*global phantom: false */
        n -= 1;
        if (code !== 0) {
            console.error('Exiting due to error ...');
            phantom.exit(code);
            return;
        }
        if (n === 0) {
            console.log('Success! All tests passed :-)');
            setTimeout(phantom.exit, 0, code);
        }
        return;
    };

    mothership = (function () {
     // Unfortunately, we have to do some version detection here. Ugh.
        if (phantom.args instanceof Object) {
            return phantom.args[0];
        }
        return require('system').args[0];
    }());

    queue = [];

    register_test = function (y, f) {
     // This function needs documentation.
        queue.push({f: f, y: y});
        return;
    };

    submit = function (y, f) {
     // This function needs documentation.
        if (n === undefined) {
            console.log('Submitting ' + queue.length + ' tests ...');
            n = queue.length;
        }
        var homepage = require('webpage').create();
        homepage.onConsoleMessage = function (message) {
         // This function needs documentation.
            if (homepage.hasOwnProperty('close')) {
             // This method didn't appear until PhantomJS 1.7.0 ...
                homepage.close();
            }
            console.log('[submitter]', message);
            if (message === y) {
                return exit(0);
            }
            if (message.slice(0, 6) === 'Error:') {
                return exit(1);
            }
            console.log('Incorrect answer! (' + message + ' !== ' + y + ')');
            return exit(2);
        };
        homepage.onError = function (message) {
         // This function needs documentation.
            var obj = JSON.stringify(message, undefined, 4);
            console.error('Submitter Error:', obj);
            if ((homepage instanceof Object) &&
                    (homepage.hasOwnProperty('close'))) {
                homepage.close();
            }
            return exit(1);
        };
        homepage.onResourceReceived = function () {
         // This function needs documentation.
            return;
        };
        homepage.onResourceRequested = function () {
         // This function needs documentation.
            //console.log(request.method, request.url);
            return;
        };
        homepage.open(mothership, function (load_status) {
         // This function needs documentation.
            if (load_status !== 'success') {
                console.error('Something went wrong:', load_status);
                return exit(1);
            }
            console.log('Running test ...');
            homepage.evaluate(f);
            return;
        });
        return;
    };

    volunteer = function (f) {
     // This function needs documentation.
        var homepage = require('webpage').create();
        homepage.onConsoleMessage = function (message) {
         // This function needs documentation.
            console.log('[volunteer]', message);
            if (message.slice(0, 6) === 'Error:') {
                return exit(1);
            }
            return;
        };
        homepage.onError = function (message) {
         // This function needs documentation.
            var y = JSON.stringify(message, undefined, 4);
            console.error('Volunteer Error:', y);
            return;
        };
        homepage.onResourceReceived = function () {
         // This function needs documentation.
            //console.log('Received:', request.url);
            return;
        };
        homepage.onResourceRequested = function () {
         // This function needs documentation.
            //console.log(request.method, request.url);
            return;
        };
        homepage.open(mothership, function (load_status) {
         // This function needs documentation.
            if (load_status !== 'success') {
                console.error('Something went wrong:', load_status);
                return exit(1);
            }
            homepage.evaluate(f);
            return;
        });
        return;
    };

 // Test definitions

    console.log('NOTE: Test box is "make-check".');

    register_test('Results: 1', function f() {
     // This function tests that the API server allows underscores as valid
     // characters in an avar's "key" property. Admittedly, it's not a very
     // good test ...
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar(0);
        x.box = 'make-check';
        x.key = '_underscore_';
        x.Q(function (evt) {
         // This function needs documentation.
            this.val += 1;
            return evt.exit();
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error: ' + JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 1.1', function f() {
     // This function tests that the API server allows hyphens as valid
     // characters in an avar's "key" property. Admittedly, it's not a very
     // good test ...
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar(0.1);
        x.box = 'make-check';
        x.key = '-hyphen-';
        x.Q(function (evt) {
         // This function needs documentation.
            this.val += 1;
            return evt.exit();
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error: ' + JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 2', function f() {
     // This function tests "Method Q" for the case when the `box` and `val`
     // parameters are assigned after the avar has been constructed.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar();
        x.box = 'make-check';
        x.val = 0;
        x.Q(function (evt) {
         // This function needs documentation.
            this.val += 2;
            return evt.exit();
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 3', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the transform `f` is an anonymous JavaScript function.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'make-check',
            f: function (x) {
             // This function needs documentation.
                return x + 2;
            },
            x: 1
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 4', function f() {
     // This function tests `QM.submit` for the case when the input arguments
     // are entered individually.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit(2, function (x) {
         // This function needs documentation.
            return x + 2;
        }, 'make-check').Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 5', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the transform `f` is a CoffeeScript string.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'make-check',
            f: '(x) -> x + 2',
            x: 3
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 6', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the data `x` are represented by an avar.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'make-check',
            f: function (x) {
             // This function needs documentation.
                return x + 2;
            },
            x: window.QM.avar(4)
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 7', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object, the transform `f` is a CoffeeScript string, and the data `x`
     // are represented by an avar.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'make-check',
            f: '(x) -> x + 3',
            x: window.QM.avar(4)
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 8', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the data `x` are represented by an avar with an explicit
     // `box` value. The expected behavior here is to use "make-check", not
     // "booger".
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar(4);
        x.box = 'booger';
        window.QM.submit({
            box: 'make-check',
            f: function (x) {
             // This function needs documentation.
                return x * 2;
            },
            x: x
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 3,6,9,12,15', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var mapf, x;
        mapf = '(x) -> 3 * x';
        x = [1, 2, 3, 4, 5];
        window.QM.map(x, mapf, 'make-check').Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 15', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var redf, x;
        redf = '(a, b) -> a + b';
        x = [1, 2, 3, 4, 5];
        window.QM.reduce(x, redf, 'make-check').Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

    register_test('Results: 45', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var mapf, redf, x;
        mapf = '(x) -> 3 * x';
        redf = '(a, b) -> a + b';
        x = [1, 2, 3, 4, 5];
        window.QM.mapreduce(x, mapf, redf, 'make-check').Q(function (evt) {
         // This function needs documentation.
            console.log('Results: ' + this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message));
            return;
        });
        return;
    });

 // Invocations

    (function () {
     // This function configures a submitter.
        var i;
        for (i = 0, n = queue.length; i < n; i += 1) {
            submit(queue[i].y, queue[i].f);
        }
        return;
    }());

    (function () {
     // This function configures a volunteer.
        volunteer(function f() {
         // This function runs inside the volunteer context :-)
            if (window.hasOwnProperty('QM') === false) {
             // We will also assume that QMachine will eventually load.
                setTimeout(f, 100);
                return;
            }
            window.QM.box = 'make-check';
            window.QM.start();
            return;
        });
        return;
    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
