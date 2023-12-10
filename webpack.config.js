const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        index: path.join(__dirname, 'src/scripts', 'index.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
        },
    },
    devtool: 'inline-source-map',
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         title: 'Development',
    //     }),
    // ],
    module: {
        rules: [{
            exclude: /node_modules/
        }]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 5501,
        historyApiFallback: true,
    }
}