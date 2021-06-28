const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf.js')

const entry = {
  app: './src/app.js'
}

module.exports = merge(baseWebpackConfig, {
  entry: entry,
  devtools: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})
