const path = require('path');

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
                'assets': resolve('./src/assets/'),
            }
        }
    }
}
