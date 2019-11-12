import path from 'path';
import { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const DEBUG = process.env.NODE_ENV !== 'production';

const config: Configuration = {
  mode: DEBUG ? 'development' : 'production',
  devtool: DEBUG ? 'cheap-module-eval-source-map' : undefined,
  entry: {
    main: './src/index.tsx',
    config: './src/js/config',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '~/src': path.resolve(__dirname, './src'),
    },
  },
  plugins: [],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
            unused: true,
            dead_code: true,
            drop_console: true,
          },
          output: { comments: false },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
        },
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'src/dist'),
    filename: DEBUG ? '[name].bundle.js' : '[name].[chunkhash:8].js',
    publicPath: '/',
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
      },
      {
        test: /\.[tj]sx?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
};

export default config;
