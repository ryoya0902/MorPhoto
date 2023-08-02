import type { StorybookConfig } from "@storybook/nextjs";
// https://storybook.js.org/recipes/@vanilla-extract/css
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  staticDirs: ["../public"],
  core: {},
  // 👇 Add this for Vanilla Extract
  webpackFinal(config, options) {
    // Add Vanilla-Extract and MiniCssExtract Plugins
    config.plugins?.push(
      new VanillaExtractPlugin(),
      new MiniCssExtractPlugin()
    );

    // Exclude vanilla extract's "*.vanilla.css" files from other "*.css" processing
    config.module?.rules?.forEach((rule) => {
      if (
        typeof rule !== "string" &&
        rule &&
        rule.test instanceof RegExp &&
        rule.test.test("test.css")
      ) {
        rule.exclude = /\.vanilla\.css$/i;
      }
    });
    config.module?.rules?.push({
      // Targets only CSS files generated by vanilla-extract
      test: /\.vanilla\.css$/i,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: require.resolve("css-loader"),
          options: {
            // Required as image imports should be handled via JS/TS import statements
            url: false,
          },
        },
      ],
    });
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
        }),
      ];
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "../src"),
      };
    }
    return config;
  },
  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: {
        fsCache: true,
        lazyCompilation: true,
      },
    },
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
