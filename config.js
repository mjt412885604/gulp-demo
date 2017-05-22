var ROOT_DEV = 'src';
var ROOT_BUILD = 'build';

module.exports = {
	dev: {
		html: ROOT_DEV + '/**/*.html',
		css: ROOT_DEV + '/css/*.css',
		js: ROOT_DEV + '/js/*.js',
		sass: ROOT_DEV + '/sass/*.scss',
		index: ROOT_DEV + '/index.html',
		images: ROOT_DEV + '/images/**/*',
		sprites: ROOT_DEV + '/images/icon/*.png'
	},
	build: {
		html: ROOT_BUILD + '/pages/',
		css: ROOT_BUILD + '/css/',
		js: ROOT_BUILD + '/js/',
		images: ROOT_BUILD + '/images/',
		sass: ROOT_DEV + '/css/',
		index: ROOT_BUILD + ''
	},
	rootDev: ROOT_DEV,
	rootBuild: ROOT_BUILD
}