import DanceAnimation from './commons/DanceAnimation';
import PairElement from './commons/elements/double/PairElement';
import RotatePairElement from './commons/elements/double/RotatePairElement';
import ZapateoElement from './commons/elements/single/ZapateoElement';
import ZarandeoElement from './commons/elements/single/ZarandeoElement';
import VueltaElement from './commons/elements/double/VueltaElement';
import {getOppositePosition, Timer} from './commons/utils';
import {escondido} from './svg/svg';

export default class EscondidoAnimation extends DanceAnimation {
	constructor(id) {
		super(id);

		this.width = 440;
		this.height = 440;
		this.startPos = {
			left: {x: 50, y: 390, angle: 225},
			top: {x: 50, y: 50, angle: 315},
			right: {x: 390, y: 50, angle: 45},
			bottom: {x: 390, y: 390, angle: 135}
		};

		this.elements = {
			giro: new PairElement(this, {
				left: escondido.giro_left,
				right: escondido.giro_right
			}),

			vuelta: new VueltaElement(this, escondido.vuelta),

			zapateo: new ZapateoElement(this),

			zarandeo: new ZarandeoElement(this, {
				left: escondido.zarandeo_left,
				top: escondido.zarandeo_top,
				right: escondido.zarandeo_right,
				bottom: escondido.zarandeo_bottom
			}),

			mediaVuelta: new PairElement(this, {
				left: escondido.media_vuelta_left,
				right: escondido.media_vuelta_right
			}),

			coronacion: new PairElement(this, {
				left: escondido.coronacion_left,
				right: escondido.coronacion_right
			}),

			esquina: new RotatePairElement(this, {
				left: esquina_left,
				top: esquina_top,
				right: esquina_right,
				bottom: esquina_bottom
			}, 270),

			balanceo1: new PairElement(this, {
				left: balanceo_left,
				top: balanceo_top,
				right: balanceo_right,
				bottom: balanceo_bottom
			}),

			balanceo2: new PairElement(this, {
				left: balanceo2_left,
				top: balanceo2_top,
				right: balanceo2_right,
				bottom: balanceo2_bottom
			})
		};
	}

	esquina(seconds, manPosition, beats) {
		this.clearPaths();
		var partSeconds = seconds / 4;
		var firstPartSeconds = partSeconds * 2;
		var partBeats = beats / 4;
		var manAngle = this.startPos[manPosition].angle;
		var womanAngle = this.startPos[getOppositePosition(manPosition)].angle;
		this.elements.esquina.drawPath(manPosition);
		this.elements.balanceo1.drawPath(manPosition, true);
		this.elements.balanceo2.drawPath(manPosition, true);

		if ((manPosition == 'left') || (manPosition == 'right')) {
			this.initRotateIcon(50, 220, 0, false);
			this.initRotateIcon(390, 220, 0, false);
		} else {
			this.initRotateIcon(220, 50, 90, false);
			this.initRotateIcon(220, 390, 90, false);
		}

		this.elements.balanceo1.setAngles(manAngle, womanAngle);
		this.elements.balanceo2.setAngles(manAngle, womanAngle);
		this.elements.balanceo1.easing = mina.easeout;
		this.elements.balanceo2.easing = mina.easeout;

		this.elements.esquina.startAnimation(firstPartSeconds, partBeats * 2, manAngle, womanAngle);
		this.elements.balanceo1.startAnimation(partSeconds, partBeats, this.DIRECTION_STRAIGHT_FORWARD, firstPartSeconds, 0, 1);
		this.elements.balanceo2.startAnimation(partSeconds, partBeats, this.DIRECTION_STRAIGHT_FORWARD, firstPartSeconds + partSeconds, 0, 1);
	}

	vueltaGiro(seconds, manPosition, beats) {
		const firstPart = 6 / beats;
		const secondPart = 2 / beats;

		this.elements.vuelta.fullAnimation(seconds * firstPart, beats * firstPart, manPosition);
		this.elements.giro.fullAnimation(seconds * secondPart, beats * secondPart, manPosition, this.DIRECTION_FORWARD, seconds * firstPart);
	}

	zapateo(seconds, manPosition, beats) {
		this.setAtStart(manPosition);
		this.elements.zapateo.fullAnimation(seconds, beats, manPosition);
	}

	zarandeo(seconds, manPosition, beats) {
		this.setAtStart(manPosition);
		this.clearPaths();
		this.elements.zarandeo.drawPath(getOppositePosition(manPosition));
		const parts = beats >= 8 ? 4 : 2;
		const partSeconds = seconds / parts;
		const partBeats = beats / parts;
		this.elements.zarandeo.startAnimation(partSeconds, partBeats, this.DIRECTION_FORWARD, 0, 0, 0.5);
		this.elements.zarandeo.startAnimation(partSeconds, partBeats, this.DIRECTION_BACKWARD, partSeconds, 0.5, 1);
		if (beats >= 8) {
			this.elements.zarandeo.startAnimation(partSeconds, partBeats, this.DIRECTION_FORWARD, partSeconds * 2, 0, 0.5);
			this.elements.zarandeo.startAnimation(partSeconds, partBeats, this.DIRECTION_BACKWARD, partSeconds * 3, 0.5, 1);
		}
	}

	mediaVuelta(seconds, manPosition, beats) {
		this.elements.mediaVuelta.fullAnimation(seconds, beats, manPosition);
	}

	coronacion(seconds, manPosition, beats) {
		this.elements.coronacion.fullAnimation(seconds, beats, manPosition);
	}
}
