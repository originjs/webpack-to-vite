const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf.js')
const path = require("path");

const entry = {
  app: './app.js'
}

module.exports = merge(baseWebpackConfig, {
  entry: entry,
  devtools: '#cheap-module-eval-source-map',
  alias: {
    src: path.resolve(__dirname, 'src')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})
