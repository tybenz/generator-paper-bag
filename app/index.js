var Promise = require( 'bluebird' );
var generators = require( 'yeoman-generator' );
var chalk = require( 'chalk' );
var fs = Promise.promisifyAll( require( 'fs' ) );
var templateContext = {};

var existsAsync = function( filePath ) {
    return new Promise( function( resolve, reject ) {
        fs.exists( filePath, function( exists ) {
            resolve( exists );
        });
    });
};

module.exports = generators.Base.extend({
    installingPaperBag: function() {
        this.npmInstall( [ 'paper-bag' ], { save: true } );
    },

    installingDevStuff: function() {
        this.npmInstall( [ 'nock', 'mocha', 'supertest', 'knex' ], { saveDev: true } );
    },

    prompting: function() {
        var generator = this;
        var done = this.async();
        var inputs = [
            { type: 'input', name: 'appName', message: 'Your project name', default: this.appname },
            { type: 'input', name: 'appDescription', message: 'Your project description', default: 'Paper Bag App' },
            { type: 'input', name: 'githubPath', message: 'GitHub path', default: 'username/repo' },
            { type: 'input', name: 'port', message: 'Port', default: 3000 }
        ];

        var next = function() {
            if ( inputs.length === 0 ) {
                return done();
            }
            generator.prompt( inputs.shift(), function( answers ) {
                var key = Object.keys( answers )[ 0 ];
                var answer = answers[ key ];
                templateContext[ key ] = answer;
                next();
            });
        };

        next();
    },

    writing: function() {
        var generator = this;
        var done = this.async();
        var root = this.sourceRoot();

        var traverse = function( dir ) {
            var relativeDir = dir.replace( root, '' );
            return existsAsync( './' + relativeDir )
            .then( function( exists ) {
                if ( !exists ) {
                    console.log( chalk.green( '   create' ) + ' ' + relativeDir.replace( /^\//, '' ) );
                    return fs.mkdirAsync( './' + relativeDir );
                } else if ( relativeDir ) {
                    console.log( chalk.cyan( 'identical' ) + ' ' + relativeDir.replace( /^\//, '' ) );
                }
            })
            .then( function() {
                return fs.readdirAsync( dir );
            })
            .then( function( list ) {
                return Promise.all(
                    list.map( function( file ) {
                        if ( file.match( /\..*$/ ) ) {
                            generator.fs.copyTpl(
                                dir + '/' + file,
                                generator.destinationPath( relativeDir + '/' + file ),
                                templateContext
                            );
                        } else {
                            return traverse( dir + '/' + file );
                        }
                    })
                );
            })
            .catch( function( err ) {
                throw err;
            });
        };

        traverse( root )
        .then( function() {
            done();
        })
        .catch( function( err ) {
            throw err;
        });
    }
});
