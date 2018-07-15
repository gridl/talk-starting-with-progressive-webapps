/**
 * Server Webpack Config
 *
 * This configuration is used to build the script file that will be used
 * to run the express.js server.
 *
 * Note: The server needs the build index.html, so make sure that you have
 *       run the client webpack build first
 *
 * @author Elze Kool <efrkool@live.nl>
 */

const nodeExternals = require('webpack-node-externals');
const path = require('path');

const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
    target: "node",
    mode: isProduction ? 'production' : 'development',
    entry: [ './app/server/index.js' ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'server.js'
    },
    module: {
        rules: [

            // HTML loader is used to be able to include .html files. In this case
            // this is used to import the client HTML file. We can then use this
            // file to inject the rendered React content into
            {
                test: /.html$/,
                loader: 'html-loader'
            },

            // Ignore all CSS when rendering server side. CSS will be bundled and included
            // into the index.html generated by the client side build
            {
                test: /\.css$/,
                loader: 'ignore-loader'
            },

            {
                oneOf: [
                    // URL loader will give back a URL when imported. But then small than given size
                    // it will return a data-url. In this case we use 2kB as max size (this is smaller than
                    // on the client side, but we want to prevent large HTML responses)
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: 'url-loader',
                        options: {
                            limit: 2*1024,
                            name: 'generated/media/[name].[hash:8].[ext]',
                        },
                    },

                    // Babel loader is use for Javascript files. Babel will transpile ES6, JSX, etc
                    // to node compatible code. We exclude /node_modules/ no prevent that we need
                    // to transpile the whole code base.
                    {
                        test: /.js$/,
                        loader: 'babel-loader',
                        include: path.join(__dirname, 'app'),
                        exclude: '/node_modules/',
                        query: {
                            plugins: [ ["transform-object-rest-spread", { "useBuiltIns": true }] ],
                            presets: [
                                // Setup the env preset to target output to the node version we
                                // use to transpile with
                                [ 'env', { node : 'current '} ],
                                'react'
                            ]
                        }
                    }
                ]
            }
        ]
    },
    externals: [
        // For the server we exclude all external (node_modules) imports. This way
        // we keep the output as small as possible. Downside is that for running our
        // server we need to have to run `yarn install`.
        nodeExternals()
    ],
    node: {
        // By default webpack will replace __dirname with /. For serving static assets
        // we need the actual __dirname functionality. So disable this webpack feature
        __dirname: false
    }
};
