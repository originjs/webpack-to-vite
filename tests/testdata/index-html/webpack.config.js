const path = require('path')

module.exports = {
  context: path.join(__dirname, 'pages'),
  entry: {
    app1: './app1.js',
    app2: ['./app2.js', './app3.js'],
    app3: {
      import: ['./app4.js', './app5.js']
    }
  }
}
