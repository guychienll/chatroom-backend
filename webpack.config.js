const path = require("path");
const nodeExternals = require("webpack-node-externals");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/server.ts",
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
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js|ts)$/i,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "ts-loader",
          },
        ],
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
