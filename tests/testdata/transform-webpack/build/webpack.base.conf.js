const path = require('path')
const webpack = require("webpack");
const sourcePath = path.join(__dirname, './src');

module.exports = {
  mode: 'development',
  context: sourcePath,
  entry: './main.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './dist')
  },
  devServer: {
    contentBase: sourcePath,
    hot: true,
    inline: true,
    historyApiFallback: {
      disableDotRule: true
    },
    stats: 'minimal',
    clientLogLevel: 'warning',
    port: 5000,
    host: 'https://www.example.com',
    open: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000000,
            esModule: false
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ]
}
