const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  baseUrl: '/src',
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  productionSourceMap: true,
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
  },
  devServer: {
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
  css: {
    extract: true,
    loaderOptions: {
      sass: {
        additionalData: `$injectedColor: orange;`
      },
      less: {
        lessOptions: {
          modifyVars: {
            'vab-color-blue': '#1899ff'
          }
        }
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
          path.resolve(__dirname, 'src/styles/_variables.scss'),
          path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  build: {
    outputDir: path.resolve(__dirname, '/dist'),
  }
}
