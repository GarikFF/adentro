var schemes = require('./schemes.js');
var URI = require('urijs/src/URI.js');
import AnimationLoader from './loading/animation_loading.js';

function supports_history_api() {
	return !!(window.history && history.pushState);
}

export default class Navigation {
	constructor(main) {
		this.context = {};
		this.main = main;
	}

	/**
	 * Загрузить схему
	 * @param  {String} name         Идентификатор схемы
	 * @param  {String} animationId  Идентификатор анимации
	 * @param  {String} musicId      Идентификатор композиции
	 */
	loadSchemaByName(name, animationId, musicId) {
		var schemaParams = schemes[name];
		if (!schemaParams) {
			schemaParams = schemes['chacarera'];
		}
		schemaParams(scheme => {
			this.main.loadSchema(scheme, musicId, animationId);
		});
		this.main.showLanguageLinks();
	}

	/**
	 * Загрузить редактор тайминга
	 * @param  {String} name     Идентификатор схемы
	 * @param  {String} musicId  Идентификатор композиции
	 */
	loadSchemaEditorByName(name, musicId) {
		var schemaParams = schemes[name];
		if (!schemaParams) {
			schemaParams = schemes['chacarera'];
		}
		schemaParams(scheme => {
			this.main.loadSchemaEditor(scheme, musicId);
		});
		this.main.showLanguageLinks();
	}

	/**
	 * Получить ссылку на текущую страницу с параметром языка
	 * @param  {String} lang Идентификатор языка
	 * @return {String}      URL текущей страницы со всеми параметрами и параметром lang
	 */
	getLanguageLink(lang) {
		var uri = new URI();
		var query = uri.query(true);
		query.lang = lang;
		var newQuery = URI.buildQuery(query);
		return uri.query(newQuery).build();
	}

	/**
	 * Если поддерживается History API, то pushState, иначе - редирект
	 * @param  {Object} params Параметры запроса
	 * @param  {String} title  Заголовок страницы
	 * @param  {String} query  Фрагмент URL запроса
	 */
	pushStateOrRedirect(params, title, query) {
		if (supports_history_api()) {
			history.pushState(params, title, query);
		} else {
			window.location.href = query;
		}
	}

	/**
	 * Получить относительный адрес URL для заданных параметров
	 * @param  {String} schema    Идентификатор схемы
	 * @param  {String} animation Идентификатор анимации
	 * @param  {String} music     Идентификатор композиции
	 * @return {String}           Относительный путь URL
	 */
	getRelativeUrl(schema, animation, music) {
		return '?schema=' + schema +
			(animation ? ('&animation=' + animation) : '') +
			(music ? ('&music=' + music) : '');
		//TODO: Настройка алиасов URL. Тогда можно будет сделать нормальный relative path
		// return schema +
		// 	(animation ? ("/" + animation) : "") +
		// 	(music ? ("?music=" + music) : "");
	}

	/**
	 * Получение параметров контекста из URL
	 * @return {Object} Объект контекста
	 */
	getContextFromUrl() {
		var url = new URI();
		var segments = url.segment();
		var params = url.query(true);
		var context = {};
		context.schema = params.schema;
		context.animation = params.animation;
		//TODO: Настройка алиасов URL. Тогда можно будет сделать нормальный relative path
		// context.schema = segments[0];
		// context.animation = segments[1];
		context.music = params.music;
		context.editor = params.editor;
		return context;
	}

	/**
	 * Перейти на указанную схему по URL
	 * @param  {String} schemaId Идентификатор схемы
	 */
	showSchema(schemaId) {
		this.pushStateOrRedirect({schema: schemaId},
			schemes[schemaId].name + ' - Adentro', this.getRelativeUrl(schemaId));
		this.loadSchemaByState();
	}

	/**
	 * Переключиться на определённую анимацию
	 * @param  {Number} animationId  Идентификатор анимации
	 */
	showAnimation(animationId) {
		this.context.animation = animationId;

		this.pushStateOrRedirect({
				schema: this.context.schema,
				animation: this.context.animation,
				music: this.context.music
			}, schemes[this.context.schema].name + ' - Adentro',
			this.getRelativeUrl(this.context.schema, this.context.animation, this.context.music));

		var schemaParams = schemes[this.context.schema];
		schemaParams(function (scheme) {
			var animationClassDefs = scheme.animation;
			if (typeof animationClassDefs === 'object') {
				var animationClassDef = AnimationLoader.getAnimationClassDef(animationClassDefs, animationId);
				var animationClass = animationClassDef.name;
			} else {
				var animationClass = animationClassDefs;
			}
			AnimationLoader.loadAnimation(animationClass);
			AnimationLoader.showAnimationLinks(animationClassDefs, animationId);
		});
	}

	/**
	 * Переключиться на определённую композицию
	 * @param  {Number} animationId  Идентификатор анимации
	 */
	showMusic(musicId) {
		this.context.music = musicId;
		this.pushStateOrRedirect({
				schema: this.context.schema,
				animation: this.context.animation,
				music: this.context.music
			}, schemes[this.context.schema].name + ' - Adentro',
			this.getRelativeUrl(this.context.schema, this.context.animation, this.context.music));

		var schemaParams = schemes[this.context.schema];
		schemaParams(function (scheme) {
			var musicIds = schemaParams.music;
			var musicSchema = musicData[musicId];
			this.main.player.loadMusicSchema(musicSchema);
			this.main.showMusicLinks(musicIds, musicId);
		});
		this.main.showLanguageLinks();
	}

	/**
	 * Загрузить схему через History
	 * @return {Boolean} True если схема была загружена
	 */
	loadSchemaByState() {
		var state = history.state;
		if (state.schema) {
			this.context.schema = state.schema;
			this.context.animation = state.animation;
			this.context.music = state.music;
			if (this.context.editor) {
				this.loadSchemaEditorByName(this.context.schema, this.context.music);
			} else {
				this.loadSchemaByName(this.context.schema, this.context.animation, this.context.music);
			}
			return true;
		}
		return false;
	}

	/**
	 * Загрузить схему из URL
	 * @return {Boolean} True если схема была загружена
	 */
	loadSchemaByUrl() {
		let context = this.getContextFromUrl();
		if (context.schema) {
			if (context.editor) {
				this.loadSchemaEditorByName(context.schema, context.music);
			} else {
				this.loadSchemaByName(context.schema, context.animation, context.music);
			}
			return true;
		}
		return false;
	}

}
