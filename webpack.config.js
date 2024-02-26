const path = require("path");
const nodeExternals = require("webpack-node-externals");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/server.js",
  stats: "errors-only",
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devtool: "source-map",
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  devServer: {
    port: 8000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js)$/i,
        exclude: [/node_modules/],
        loader: "babel-loader",
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
