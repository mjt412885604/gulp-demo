var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass'); // sass的编译
var autoprefixer = require('gulp-autoprefixer'); // 自动添加css前缀
var uglify = require('gulp-uglify'); // 压缩js代码
var minifycss = require('gulp-minify-css') // 压缩css代码
var imagemin = require('gulp-imagemin'); // 图片压缩
var pngquant = require('imagemin-pngquant'); // 图片无损压缩
var cache = require('gulp-cache'); // 检测文件是否更改
var clean = require('gulp-clean'); // 清理文件
var htmlmin = require('gulp-htmlmin'); // 压缩html
var babel = require('gulp-babel'); // 编译ES6
var gulpSequence = require('gulp-sequence'); // 顺序执行
var plumber = require('gulp-plumber'); // 监控错误
var notify = require('gulp-notify'); // 加控制台文字描述用的
var eslint = require('gulp-eslint'); // 代码风格检测工具
var del = require('del'); // 删除文件

var spritesmith = require('gulp.spritesmith')

// 静态服务器和代理请求
var url = require('url');
var proxy = require('http-proxy-middleware');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

const config = require('./config');

var onError = function(error) {
    var title = error.plugin + ' ' + error.name;
    var msg = error.message;
    var errContent = msg.replace(/\n/g, '\\A '); // replace to `\A`, `\n` is not allowed in css content

    // system notification
    notify.onError({
        title: title,
        message: errContent,
        sound: true
    })(error);

    // prevent gulp process exit
    this.emit('end');
};


gulp.task('clean', function() {
    del(config.rootBuild).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

/* eslint 语法检查 */
gulp.task('eslint', function() {
    return gulp
        .src([config.dev.js, '!node_modules/**'])
        .pipe(plumber(onError))
        .pipe(eslint({
            configFle: './.eslintrc'
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
})

/* js 压缩 */
gulp.task('jsmin', ['eslint'], function() {
    return gulp.src(config.dev.js)
        .pipe(babel({
            presets: ['es2015'],
            plugins: []
        }))
        .pipe(uglify({
            compress: true,
            mangle: {
                except: ['require', 'exports', 'module', '$']
            }
        }))
        .pipe(gulp.dest(config.build.js))
});

/* css 压缩 */
gulp.task('cssmin', function() {
    var AUTOPREFIXER_BROWSERS = [
        'last 6 version',
        'ie >= 6',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.0',
        'bb >= 10'
    ];

    return gulp
        .src(config.dev.css)
        .pipe(sass())
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(minifycss())
        .pipe(gulp.dest(config.build.css))
});

/* html 压缩 */
gulp.task('indexmin', function() {
    var optionsSet = {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true, // 压缩HTML
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false, // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false, // 删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false, // 删除<style>和<link>的type="text/css"
        minifyJS: true, // 压缩页面JS
        minifyCSS: true // 压缩页面CSS
    };
    return gulp.src(config.dev.index)
        .pipe(htmlmin(optionsSet))
        .pipe(gulp.dest(config.build.index))
});

// 处理图片
gulp.task('images', () => {
    return gulp.src(config.dev.images)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(config.build.images));
});


// 开发环境进行监控
gulp.task('html', function() {
    return gulp.src(config.dev.html)
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js', ['eslint'], function() {
    return gulp.src(config.dev.js)
        .pipe(reload({
            stream: true
        }));
});

gulp.task('css', function() {
    var AUTOPREFIXER_BROWSERS = [
        'last 6 version',
        'ie >= 6',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.0',
        'bb >= 10'
    ];
    return gulp.src(config.dev.sass)
        .pipe(sass())
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(config.build.sass))
        .pipe(reload({
            stream: true
        }));
});

// 合成雪碧图
gulp.task('sprites', function() {
    return gulp.src(config.dev.sprites) //需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'images/sprite.png', //保存合并后图片的地址
            cssName: 'css/sprite.css', //保存合并后对于css样式的地址
            padding: 10, //合并时两个图片的间距
            algorithm: 'binary-tree', //注释1
            cssTemplate: function(data) {
                var arr = [];
                data.sprites.forEach(function(sprite) {
                    arr.push(".icon-" + sprite.name +
                        "{" +
                        "background-image: url('" + sprite.escaped_image + "');" +
                        "background-position: " + sprite.px.offset_x + " " + sprite.px.offset_y + ";" +
                        "width:" + sprite.px.width + ";" +
                        "height:" + sprite.px.height + ";" +
                        "}\n");
                });
                return arr.join("");
            }

        }))
        .pipe(gulp.dest('src/'));
});

gulp.task('watch', function() {
    gulp.watch(config.dev.html, ['html']);
    gulp.watch(config.dev.js, ['js']);
    gulp.watch(config.dev.sprites, ['sprites']);
    gulp.watch(config.dev.sass, ['css']);
});

gulp.task('server', function() {
    browserSync.init({ // 初始化 BrowserSync
        injectChanges: true, // 插入更改
        files: [
            '*.html', '*.css', '*.js'
        ], // 监听文件类型来自动刷新
        server: {
            baseDir: 'src', // 目录位置
            middleware: [
                proxy(['/g1/'], {
                    target: 'http://oa.cnlod.cn:8888',
                    changeOrigin: true
                }),
                proxy(['/p1/'], {
                    target: 'http://oa.cnlod.cn:8888',
                    changeOrigin: true
                })
            ]
        },
        ghostMode: { // 是否开启多端同步
            click: true, // 同步点击
            scroll: true // 同步滚动
        },
        logPrefix: 'browserSync in gulp', // 再控制台打印前缀
        browser: ["chrome"], //运行后自动打开的；浏览器 （不填默认则是系统设置的默认浏览器）
        open: true, //       自动打开浏览器
        port: '8081' // 使用端口
    });

    // 监听watch
    gulp.start('watch');

});

gulp.task('dev', ['server', 'watch']);

gulp.task('default', gulpSequence(['clean'], ['jsmin'], ['sprites'], ['cssmin'], ['images'], ['indexmin']));