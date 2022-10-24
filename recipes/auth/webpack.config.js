let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let webpack = require("webpack");

let outputDir = path.join(__dirname, "assets");

module.exports = {
  entry: "./src/Index.bs.js",
  mode: "development",
  devServer: {
    static: outputDir,
    port: 9000,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
};
