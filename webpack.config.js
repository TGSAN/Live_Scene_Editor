var PACKAGE = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path')

function getDateFormat(fmt) {
    const date = new Date(new Date().getTime());
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

module.exports = (env, argv) => {
    const outputDir = path.resolve(__dirname, 'build');
    const bannerInfo = [
        '@preserve',
        'Version Info',
        '',
        '@version        ' + `${PACKAGE.version}`,
        '@env            ' + argv.mode,
        '@buildtime      ' + getDateFormat("yyyy-MM-dd hh:mm:ss"),
        '@hash           [hash]',
        '@chunkhash      [chunkhash]',
    ].join('\n');
    const bannerCode = 'var _BUILD_TIME = "' + getDateFormat("yyyy-MM-dd hh:mm:ss") + '";';

    let defines = {};
    if (argv.mode === 'development') {
        defines["__DEVENV"] = '';
    }
    if (argv.mode === 'production') {
        defines["__PROENV"] = '';
    }

    console.log("Env: " + argv.mode);

    return {
        entry: {
            'main': './src/main.js',
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(tsx?|js)$/,
                    use:
                        [
                            {
                                loader: "babel-loader",
                                options: {
                                    presets: [
                                        "@babel/preset-typescript",
                                        [
                                            "@babel/preset-env",
                                            {
                                                "modules": false,
                                                "targets": {
                                                    "chrome": "49",
                                                    "firefox": "57",
                                                    "ie": "11"
                                                }
                                            }
                                        ]
                                    ],
                                    plugins: [
                                        "@babel/plugin-proposal-class-properties",
                                        [
                                            "@babel/plugin-transform-runtime",
                                            {
                                                corejs: 3
                                            }
                                        ]
                                    ],
                                    comments: true,
                                }
                            },
                            {
                                loader: require.resolve('webpack-preprocessor-loader'),
                                options: {
                                    defines: defines
                                }
                            }
                        ],
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        // output: {
        //     path: outputDir,
        //     filename: '[name].js',
        //     libraryTarget: 'umd',
        //     library: 'libname'
        // },
        performance: {
            hints: false
        },
        plugins: [
            new webpack.DefinePlugin({
                'PreDefine': {
                    env: JSON.stringify(argv.mode),
                    buildtime: JSON.stringify(getDateFormat("yyyy-MM-dd hh:mm:ss")),
                    version: JSON.stringify(`${PACKAGE.version}`),
                }
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: './public_files/', to: "./" },
                    { from: './src/static/', to: './static/' },
                    { from: './src/*.html', to: './[name].[ext]' },
                ]
            }),
            new webpack.BannerPlugin({
                banner: bannerCode,
                raw: true
            }),
            new webpack.BannerPlugin({
                banner: bannerInfo,
                raw: false
            }),
        ]
    };
}