var generators = require( 'yeoman-generator' );
var fs = require( 'fs' );
var options = { appName: 'foobar' };

module.exports = generators.Base.extend({
    writing: function() {
        var generator = this;
        var root = this.sourceRoot();

        var traverse = function( dir ) {
            var relativeDir = dir.replace( root, '' );
            if ( !fs.existsSync( './' + relativeDir ) ) {
                fs.mkdirSync( './' + relativeDir );
            }
            fs.readdirSync( dir ).forEach( function( file ) {
                if ( file.match( /\..*$/ ) ) {
                    generator.fs.copyTpl(
                        dir + '/' + file,
                        generator.destinationPath( relativeDir + '/' + file ),
                        options
                    );
                } else {
                    traverse( dir + '/' + file );
                }
            })
        };

        traverse( root );
    }
});
