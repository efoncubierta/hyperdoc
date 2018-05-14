const path = require("path");
const slsw = require("serverless-webpack");

// const entries = {};
//
// Object.keys(slsw.lib.entries).forEach(key => (
//   entries[key] = ['./source-map-install.js', slsw.lib.entries[key]]
// ));

module.exports = {
  entry: slsw.lib.entries,
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx", ".graphql", ".gql"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js"
  },
  target: "node",
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: "ts-loader" }
    ]
  },
  externals: ["aws-sdk"]
};
