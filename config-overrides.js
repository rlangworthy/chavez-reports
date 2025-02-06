const webpack = require("webpack");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { empty } = require("ramda");

module.exports = {
    // Other rules...
    plugins: [
        new NodePolyfillPlugin({
            additionalAliases: ['fs/promise']
        }),
    ],
    
};
module.exports = function override(config, env) {    
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "child_process": false,
        "async_hooks": false,
        "http2": false,
        "fs": require.resolve("fs-extra"),
        "fs/promises": false,
        "tls": false,
        "net": false,
        "process": require.resolve("process"),
        "http": require.resolve("stream-http"),
        "https": false, 
        "zlib": require.resolve("browserify-zlib") ,
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "os": require.resolve("os-browserify"),
        "constants": require.resolve("constants-browserify"),
        "process/browser": require.resolve('process/browser'),
        "vm": require.resolve("vm-browserify"),
    }
    
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
            const mod = resource.request.replace(/^node:/, "");
            switch (mod) {
                case 'os':
                    resource.request = 'os-browserify'
                    break
                case 'process':
                    resource.requeset = 'process/browser'
                    break
                case 'net':
                    resource.requeset = 'net'
                    break
                case 'util':
                    resource.request = 'util'
                    break
                case 'path':
                    resource.request = 'path'
                    break
                case 'http':
                    resource.request = 'stream-http'
                    break
                case 'https':
                    resource.request = 'https-browserify'
                    break
                case 'zlib':
                    resource.request = 'browserify-zlib'
                    break
                case 'url':
                    resource.request = 'url'
                    break
                case 'fs':
                    resource.request = 'fs-extra'
                    break;
                case "fs/promises":
                    resource.request = "fs/promises"
                    break;
                case "buffer":
                    resource.request = "buffer";
                    break;
                case "stream":
                    resource.request = "readable-stream";
                    break;
                case "child_process":
                    resource.request = "child_process"
                    break;
                
                default:
                    throw new Error(`Not found ${mod}`);
            }
        }),
    );
    config.ignoreWarnings = [/Failed to parse source map/];
    
    return config;
}