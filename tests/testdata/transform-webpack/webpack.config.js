const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './main.js',
    output: {
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: 'Webpack App',
          favicon: './favicon.ico',
          templateParameters: {
            foo: 'bar'
          },
          minify: {
            minifyJS: true,
            minifyCSS: true,
            useShortDoctype: true,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true
          },
          meta: {
            description: 'transform configureWebpack'
          }
        })
    ]
}
