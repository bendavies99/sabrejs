const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
   entry: './src/main.ts',
   mode: 'development',
   resolve: {
       extensions: [".ts", ".tsx", ".js", ".jsx"],
   },
   devtool: 'inline-source-map',
   devServer: {
     hot: true
   },
   output: {
       path: path.join(__dirname, 'dist'),
       filename: 'bundle.js'
   },
   plugins: [
       new HtmlWebpackPlugin({
           title: 'Development',
           template: './index.html'
       }),
   ],
   module: {
       rules: [
           {
               test: /\.(ts|tsx)$/,
               loader: 'ts-loader',
               options: {
                   compiler: 'ttypescript'
               },
               exclude: /(node_modules|\.\.\/\.\.\/packages)/
           }
       ]
   }
}