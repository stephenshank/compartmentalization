const webpack = require('webpack'),
  path = require('path'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve('js', 'index.js'),
  plugins: [
    new HtmlWebpackPlugin({
      title: "VEG Compartmentalization Models"
    }),
    new webpack.ProvidePlugin({
      d3: "d3",
      _: "underscore",
      $: "jquery"
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: __dirname
  } 
}
