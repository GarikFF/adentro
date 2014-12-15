module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		secret: grunt.file.readJSON('secret.json'),
		environments: {
			production: {
				options: {
					host: '<%= secret.ssh.host %>',
					username: '<%= secret.ssh.username %>',
					password: '<%= secret.ssh.password %>',
					port: '<%= secret.ssh.port %>',
					deploy_path: '/public_html',
					local_path: 'build/',
					current_symlink: 'current',
					debug: true
				}
			}
		},
		uglify: {
			build: {
				files: {
					'build/js/animation.min.js': [
						'js/animations/animation.js',
						'js/animations/animation4.js',
						'js/animations/animation_gato_style.js',
						'js/animations/gato.js',
						'js/animations/bailecito.js',
						'js/animations/chacarera.js',
						'js/animations/chacarera4.js',
						'js/animations/escondido.js',
						'js/animations/remedio.js',
						'js/animations/zamba.js'
					],
					'build/js/script.min.js' : [
						'js/jquery-classes.js',
						'js/script.js',
						'js/timing.js',
						'js/timing-generator.js',
						'js/navigation.js',
						'js/player.js',
						'js/tour.js'
					]
				}
			}
		},
		concat: {
			build: {
				files: {
					'build/js/thirdparty/thirdparty.min.js': [
						'js/thirdparty/jquery-2.1.1.min.js',
						'js/thirdparty/i18next-1.7.5.min.js',
						'js/thirdparty/jquery.jplayer.min.js',
						'js/thirdparty/jquery.cookie.js',
						'js/thirdparty/jquery.slimmenu.min.js',
						'js/thirdparty/snap.svg-min.js',
						'js/thirdparty/URI.min.js',
						'js/thirdparty/hopscotch.min.js'
					]
				}
			}
		},
		cssmin: {
			build: {
				files: {
					'build/css/min.css': [
						'css/jplayer.blue.monday.css',
						'css/animation.css',
						'css/danceschema.css',
						'css/hopscotch.css',
						'css/slimmenu.css'
					]
				}
			}
		},
		xmlmin: {
			build: {
				files: [
	      			{expand: true, src: ['svg/*.xsl'], dest: 'build/'},
	      			{expand: true, src: ['svg/*.svg'], dest: 'build/'}
				]
			}
		},
		compress: {
			build: {
				options: {
					mode: 'deflate'
				},
				files: [
      				{expand: true, src: ['build/js/**/*.min.js'], dest: './', ext: '.min.js.gz'},
      				{expand: true, src: ['build/css/*.css'], dest: './', ext: '.css.gz'},
				]
			}
		},
		processhtml: {
			build: {
				files: {
					'build/index.html': 'index.html'
				}
			}
		},
		htmlmin: {
			build: {
				options: {
					removeComments: true,
					collapseWhitespace:true,
					minifyJS: true
				},
				files: {
					'build/index.html': 'build/index.html'
				}
			}
		},
		lame: {
			convertmp3: {
				src: 'music/*/*.mp3'
			}
		},
		clean: {
			build: {
				src: [
					'build/*',
					'!build/music'
				]
			},
			convertmp3: {
				src: 'build/music/**/*'
			}
		},
		copy: {
			build: {
				files: [
					{
						src: [
							'img/**/*',
							'locales/**/*',
							'favicon.ico',
							'js/thirdparty/history.js',
							'js/thirdparty/*.swf',
							'js/thirdparty/history.adapter.jquery.js'
						],
						dest: 'build/'
					}
				]
			},
			convertmp3: {
				files: [
					{
						expand: true,
						src: 'music/**/*',
						dest: 'build/',
						filter: 'isDirectory'
					}
				]
			}
		},
		rename: {
			convertmp3: {
				files: [
					{
						expand: true,
						src: 'music/**/*.mp3.tmp',
						dest: 'build/',
						ext: '.mp3'
					}
				]
			}
		},
		'ftp-deploy': {
			production: {
				auth: {
					host: '<%= secret.ftp.host %>',
					port: '<%= secret.ftp.port %>',
					authPath: 'secret.json',
					authKey: 'ftpkey'
				},
				src: 'build/',
				dest: 'public_html/'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-rename');
	grunt.loadNpmTasks('grunt-xmlmin');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-processhtml');
	// grunt.loadNpmTasks('grunt-ssh-deploy');
	grunt.loadNpmTasks('grunt-ftp-deploy');

	grunt.registerMultiTask('lame', 'Convert MP3 files to web-friendly quality using Lame', function() {
		grunt.log.writeln('Conversion started...');
		var exec = require('child_process').exec;
		var done = grunt.task.current.async();

		var i = 0;
		this.files.forEach(function(file) {
			grunt.log.writeln('Processing ' + file.src.length + ' files.');

			file.src.forEach(function(f) { 
				exec('"./tools/lame.exe" -b 128 --resample 22.05 --silent ' + f + ' ' + f + '.tmp',
					function(error, stdout, stderr) {
						if (stdout && (stdout.length > 0)) {
							grunt.log.writeln('stdout: ' + stdout);
						}
						if (stderr && (stderr.length > 0)) {
							grunt.log.writeln('stderr: ' + stderr);
						}	
						if (error !== null) {
							grunt.log.writeln('exec error: ' + error);
						}
						i++;
						grunt.log.write('+');
						if (i >= file.src.length) {
							done(error);
						}
					}
				);
			});
		});
	});

	grunt.registerTask('build', [
		'clean:build', 
		'uglify:build', 
		'cssmin:build',
		'xmlmin:build',
		'processhtml:build',
		'htmlmin:build',
		'concat:build',
		'copy:build'
	]);
	grunt.registerTask('convertmp3', [
		'lame:convertmp3', 
		'clean:convertmp3',
		'copy:convertmp3',
		'rename:convertmp3'
	]);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('deploy', ['ftp-deploy:production']);

};