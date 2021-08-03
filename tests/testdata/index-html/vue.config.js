const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  pages: {
    app1: resolve('./pages/app1.js'),
    app2: {
      entry: resolve('./pages/app2.js')
    }
  }
}
