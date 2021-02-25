'use strict';
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config');

const port = 80;
const hostname = '0.0.0.0';
const preConfig = {
    "_": [],
    "cache": null,
    "bail": null,
    "profile": null,
    "color": {
        "level": 3,
        "hasBasic": true,
        "has256": true,
        "has16m": true
    },
    "colors": {
        "level": 3,
        "hasBasic": true,
        "has256": true,
        "has16m": true
    },
    "config": "webpack.config.js",
    "mode": "production",
    "info-verbosity": "info",
    "infoVerbosity": "info",
    "$0": "node_modules\\webpack\\bin\\webpack.js"
};

preConfig.mode = 'development';

const webpackConfigValue = webpackConfig(undefined, preConfig);
webpackConfigValue.mode = preConfig.mode;
webpackConfigValue.devtool = 'source-map';
const compiler = Webpack(webpackConfigValue);
const devServerOptions = Object.assign({}, webpackConfig.devServer, {
    compress: true,
    overlay: true,
    open: false,
    openPage: './index.html',
    stats: {
        colors: true,
    },
    headers: {
        'X-Custom-Server': 'webpack-dev-server',
    },
    disableHostCheck: true
});
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(port, hostname, () => {
    console.log(`Starting server on http://${hostname == '0.0.0.0' ? 'localhost' : hostname}:${port}`);
});