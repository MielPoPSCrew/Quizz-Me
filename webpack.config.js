const webpack        = require('webpack'),
      path           = require('path'),
      vendorsFiles   = require('./package.json').dependencies,
      webpackIgnore  = require('./package.json').webpackIgnore;

module.exports = {
    "entry"  : {
        "main"  : path.resolve(__dirname, 'public/js/app.js'),
        "vendor": Object.keys(vendorsFiles).filter((item) => webpackIgnore.indexOf(item) === -1)
    },
    "output" : {
        "filename"         : '[name].js',
        "path"             : path.resolve(__dirname, 'public/js'),
        "sourceMapFilename": '[name].js.map'
    },
    "module" : {
        "loaders": [
            {"test": /\.json$/, "loader": 'json-loader'}
        ]
    },
    "resolve": {
        "alias"  : {
            "hammerjs"       : path.resolve(__dirname, 'node_modules/hammerjs/hammer'),
            // Special version forked to fix jQuery issue
            "materialize-css": path.resolve(__dirname, 'node_modules/materialize-css/dist/js/materialize')
        },
        "modules": [
            path.resolve(__dirname, "node_modules")
        ],
        "plugins": [
            new webpack.optimize.CommonsChunkPlugin(
                {
                    "names": ['vendor', 'manifest']
                }
            )
        ]
    },
    "target" : 'node',
    "devtool": 'source-map'
};
