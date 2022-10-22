const path = require("path");

module.exports = {
   entry: './src/main.ts',
   mode: 'production',
   resolve: {
       extensions: [".ts", ".tsx", ".js", ".jsx"],
       fallback: {
           "path": require.resolve("path-browserify"),
           "fs": false
       }
   },
   devtool: 'source-map',
   output: {
       path: path.join(__dirname, 'dist'),
       filename: 'bundle.js'
   },
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