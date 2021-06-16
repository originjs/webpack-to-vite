const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  baseUrl: '/src',
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        '@components': resolve('./src/components'),
        assets: resolve('./src/assets/')
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
  }
}
