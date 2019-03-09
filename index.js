const Pitchfinder = require("pitchfinder");
const Tone = require("tone");

// define audio variables
const detectPitch = Pitchfinder.AMDF();//DynamicWavelet();
var audioInputBuffer = null;
var pitchHistory = [];
const MAX_PITCH_HISTORY = 12;
const INPUT_LEVEL_THRESHOLD = -45; //dB
var pitchSmoothed;
var motu;
var meter = new Tone.Meter();
var LISTENING = false;
var listening_text;
var spacebar_keydown_bool = false;

// define graphics variables
const TWO_WIDTH = 1280;
const TWO_HEIGHT = 720;
const CX = TWO_WIDTH/2;
const CY = TWO_HEIGHT/2;
const BLUE = 				'#1481BAFF';
const BLUE_TRANSPARENT = 	'#1481BA50';
const BACKGROUND_COLOR =	'#f3f3f3ff';
const TAU = 2*Math.PI;
var two;
var pitchbar;
var inputbar;
var inputmeter;

function initGraphics() {
	// Initialize Two.js here
    // Make an instance of two and place it on the page
    var elem = document.getElementById('main-container');
    var params = { fullscreen: false, width: TWO_WIDTH, height: TWO_HEIGHT };
    two = new Two(params).appendTo(elem);
    Interactions.init(two);
    TweenHelper.init(TWEEN);
    
    two.renderer.domElement.setAttribute("viewBox", "0 0 " + String(TWO_WIDTH) + " " + String(TWO_HEIGHT));
    two.renderer.domElement.removeAttribute("width");
    two.renderer.domElement.removeAttribute("height");

    pitchbar = two.makeRectangle(CX, CY, 500, 0);
    pitchbar.noStroke();
    pitchbar.fill = BLUE;

    var baseline = two.makeRectangle(CX, CY, 500, 4);
    baseline.noStroke();
    baseline.fill = 'white';

    inputbar = two.makeRectangle(CX, CY, 500, 4);
    inputbar.noStroke();
    inputbar.fill = 'red';

    inputmeter = two.makeRectangle(TWO_WIDTH-5, TWO_HEIGHT, 10, 100);
    inputmeter.noStroke();
    inputmeter.fill = '#aaffaa';

    let _y = Util.lerp(TWO_HEIGHT, 0, (100+INPUT_LEVEL_THRESHOLD)/100);
    var inputmeterthreshold = two.makeRectangle(TWO_WIDTH-5, _y, 20, 4);
    inputmeterthreshold.noStroke();
    inputmeterthreshold.fill = 'black';

    listening_text = two.makeText('', 20, 20);
    listening_text.size = 30;
    listening_text.alignment = 'left';
    listening_text.fill = 'gray';

    var _noteNames = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    var angle_offset = -0.25*TAU;
    for (let i=0; i<_noteNames.length; i++) {
    	let angle = TAU * (i/_noteNames.length) + angle_offset;
    	let dist = 200;
    	let _x = CX + Util.lengthdirX(angle, dist);
    	let _y = CY + Util.lengthdirY(angle, dist);
    	var btn = makeNoteBtn(_x, _y, _noteNames[i]);
    }
}

function makeNoteBtn(x, y, note) {
	var r = 30;
	var boundingCircle = two.makeCircle(0, 0, 2*r).noStroke();
	boundingCircle.opacity = 0;
	boundingCircle.fill = BACKGROUND_COLOR; //back-up in case opacity doesn't work

	var back = two.makeCircle(0, 0, r).noStroke();
	back.fill = '#aaaaaa';
	back.opacity = 1;

	var text = two.makeText(note, 0, 0);
	text.family = 'Comfortaa';
    text.size = 30;

    var note_btn = two.makeGroup(boundingCircle, back, text);
    note_btn.translation.set(x, y);
	
	Interactions.add(note_btn);
    Interactions.addHoverScale(note_btn);

    return note_btn;
}

function initAudioBuffer() {
	// from https://developers.google.com/web/fundamentals/media/recording-audio/
	/*var handleSuccess = function(stream) {
	    var context = new AudioContext();
	    var source = context.createMediaStreamSource(stream);

	    // from https://stackoverflow.com/questions/22233037/how-to-apply-basic-audio-filter-using-javascript/22464042
		filter = context.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 200;
		filter.Q.value = 10;

	    var processor = context.createScriptProcessor(512, 1, 1);

	    source.connect(filter);
	    filter.connect(processor);
	    processor.connect(context.destination);

	    processor.onaudioprocess = function(e) {
	      // Do something with the data, i.e Convert this to WAV
	      //console.log(e.inputBuffer);
	      audioInputBuffer = e.inputBuffer; //save the audio buffer (is there a better way to do this?)
	    };

	  };

	navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);*/

	motu = new Tone.UserMedia();
	motu.open().then(function(){
		var hp_filter = new Tone.Filter({
			type: 'highpass',
			frequency: 50,
			rolloff: -24
		});
		var lp_filter = new Tone.Filter({
			type: 'lowpass',
			frequency: 800,
			rolloff: -24
		});

		var processor = Tone.context.createScriptProcessor(1024, 1, 1);
	    processor.onaudioprocess = function(e) {
	    	if (meter.getLevel() > INPUT_LEVEL_THRESHOLD) // listen only if input it loud enough
	    		audioInputBuffer = e.inputBuffer; //save the audio buffer (is there a better way to do this?)
	    	else audioInputBuffer = null;
	    };

	    var end = Tone.context.destination;

	    motu.chain(hp_filter, lp_filter, meter, processor, end);
	    setInputListening(true);
	});
}

function getAudioBuffer() {
	return audioInputBuffer;
}

function getPitchFromAudio() {
	//from https://github.com/peterkhayes/pitchfinder
	const myAudioBuffer = getAudioBuffer(); // assume this returns a WebAudio AudioBuffer object
	if (myAudioBuffer == null) {return undefined};
	const float32Array = myAudioBuffer.getChannelData(0); // get a single channel of sound
	return detectPitch(float32Array); // null if pitch cannot be identified
}

function getPitchNoteOffset(p) {
	let note = Tone.Frequency.ftom(p);
    let note_p = Tone.Frequency.mtof(note);
    let off = p-note_p;
    return off;
}

function updatePitchDisplay(new_pitch) {
	if (new_pitch != undefined) {
		
		// save the pitch into pitch history
		pitchHistory.push(new_pitch);
		if (pitchHistory.length>MAX_PITCH_HISTORY)
			pitchHistory.shift(); //remove oldest recorded pitch
		pitchSmoothed = Util.arrayAverage(pitchHistory);

		// analyze and report the pitch accuracy
	    let off_raw = getPitchNoteOffset(new_pitch);
	    let off_smoothed = getPitchNoteOffset(pitchSmoothed);
		
		let pitch_display = Math.round(new_pitch) + ' Hz';
		pitch_display += '<br/>'+Tone.Frequency(Tone.Frequency.ftom(new_pitch), "midi").toNote();
		pitch_display += '<br/>'+off_raw;
		document.getElementById("test").innerHTML = pitch_display;

		// update visuals
		let scale = -60;
	    pitchbar.vertices[0].y = pitchbar.vertices[1].y = scale*off_smoothed;
	    inputbar.translation.y = CY+scale*off_raw;
	}

	pitchbar.fill = (meter.getLevel() < -40) ? BLUE_TRANSPARENT : BLUE;
	inputmeter.vertices[0].y = inputmeter.vertices[1].y = -Util.lerp(0, TWO_HEIGHT, (100+meter.getLevel())/100);
}

function setInputListening(active) {
	if (active == false) {
		motu.close();
		listening_text.value = 'not listening (SPACEBAR)';
	} else {
		motu.open();
		listening_text.value = 'listening (SPACEBAR)';
	}
	LISTENING = active;
}

function init() {
	initGraphics();
	initAudioBuffer();
}

function debugUpdate() {
	$(window).keydown(function(e) {
    	if (e.which === 32 && !spacebar_keydown_bool) { //spacebar
    		setInputListening(!LISTENING);
    		spacebar_keydown_bool = true;
    	}
	});

	$(window).keyup(function(e) {
		if (e.which === 32) {//spacebar
			spacebar_keydown_bool = false;
		}
	});
}

// Our main update loop!
function update() {

    updatePitchDisplay(getPitchFromAudio());

    two.update();
    TWEEN.update();

    debugUpdate();

    //if (meter != undefined)	console.log(meter.getLevel());

    // Ask the browser to run this on the next frame please   「 次のフラムをください。」
    requestAnimationFrame( update );
}

init();
update();