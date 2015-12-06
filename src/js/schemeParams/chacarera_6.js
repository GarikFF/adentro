module.exports = {
	name: 'Chacarera on 6',
	svgName: require('svgData/chacarera_6.svg'),
	music: [require('musicData/la_penadora'), require('musicData/la_baguala')],
	animation: [{id: 'onTwo', animClass: require('animationClasses/ChacareraAnimation'), title: 'animation_links.two_people'},
				{id: 'onFour', animClass: require('animationClasses/Chacarera4Animation'), title: 'animation_links.four_people'}/*,
				{id: 'cadena', animClass: require('animationClasses/ChacareraCadenaAnimation'), title: 'Cadena'}*/],
	info: require('infoData/chacarera'),
	zapateo: true
};