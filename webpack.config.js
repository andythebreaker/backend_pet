const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ASSET_PATH = process.env.ASSET_PATH || '../';
const env = process.env.NODE_ENV;
function port(minNum, maxNum) {
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}
const getEntry = () => {
    const entry = {};
    glob.sync('./src/js/*.js').forEach((name) => {
        const start = name.indexOf('/src/js/') + 8;
        const end = name.length - 3;
        const eArr = [];
        const n = name.slice(start, end);
        eArr.push(name);
        entry[n] = eArr;
    });
    return entry;
};
const config = {

    //入口文件
    entry: getEntry(),

    //出口文件
    output: {
        path: path.resolve(__dirname, './dist'),// 打包後儲存的目錄
        filename: './js/[name].js',//打包後的js檔名
    },

    watch: true,
    devServer: {
        //...
        port: 8080
        //...
     },
    mode: env || 'development', //請記得設定好package.json的build模式與dev模式載入的開發mode為development或是production
    module: {
        rules: [//各類型檔案配置規則
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            },
            {
                //以pug為例的設定方式
                test: /\.pug$/,//判斷.pug檔案
                use: [//使用html-loader以及pug-html-loader來編譯檔案
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: false // 不壓縮 HTML
                        }
                    },
                    {
                        loader: 'pug-html-loader',
                        options: {
                            pretty: true // 美化 HTML 的編排 (不壓縮HTML的一種)
                        }
                    },
                ]
            },

            {
                test: /\.(sc|sa|c)ss$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: ASSET_PATH
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    'postcss-loader',
                    'sass-loader'

                ]
            },

            {
                test: /\.styl$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: ASSET_PATH
                        }
                    },
                    'css-loader',
                    'postcss-loader',
                    'stylus-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|jpge|gif)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192, //bytes
                        name: '[name].[ext]?[hash:7]',
                        outputPath: 'images'
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    // name: utils.assetsPath('media/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 8192, //bytes
                        name: '[name].[ext]?[hash:7]',
                    }
                }
            }
        ]
    },

    plugins: [//Loader無法處理的部分由plugins來解決
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jquery: "jQuery",
            "window.jQuery": "jquery"
        }),
        new MiniCssExtractPlugin({
            filename: './css/[name].css',
            chunkFilename: "./css/[name].css"
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [
                    autoprefixer()
                ]
            }
        }),
        new HtmlWebpackPlugin({
            template: `./src/${name}.pug`, //pug的檔案位置
            filename: `${name}.html`, //打包後轉換的檔案名稱與副檔名
        })
    ],
    resolveLoader: {//用來判斷webpack Loader的resolve配置
        extensions: ['.js', '.vue', '.styl'],
    },
    resolve: { //配置索引，縮短webpack的解析時間，提升打包速度
        alias: {
            'vue': 'vue/dist/vue.js',
            jquery: "jquery/src/jquery",
        }
    },
    stats: {
        builtAt: false,
        children: false,
        chunks: false,
        modules: false,
        timings: false,
        version: true // webpack v
    },
    devServer: {
        port: port(8000, 9000),
        open: true,
        hot: true,
    },
    optimization: {
        minimize: false,
        runtimeChunk: {
            name: 'runtime'
        },
        splitChunks: {
            chunks: 'all',
            name: true,
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'common',
                    chunks: 'initial',
                    enforce: true,
                    priority: 2,
                },
                action: {
                    name: 'action',
                    chunks: 'initial',
                    priority: 1,
                    minChunks: 2,
                },
            },
        },
    },
};
Object.keys(config.entry).forEach((name) => {
    config.plugins.push(new HtmlWebpackPlugin({
        template: `./src/${name}.pug`,
        filename: `${name}.html`,
        chunks: ['common', 'runtime', 'vendor', 'action', `${name}`],
        minify: {
            removeComments: false,
            collapseWhitespace: false, // 壓縮 HTML
            removeAttributeQuotes: false,
        },
    }));
});
module.exports = config;//webpack起始設定