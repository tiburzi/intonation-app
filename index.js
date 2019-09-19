const Pitchfinder = require("pitchfinder");
const Tone = require("tone");

// define audio variables
const detectPitch = Pitchfinder.DynamicWavelet();
var audioInputBuffer = null;
var pitchHistory = [];
const MAX_PITCH_HISTORY = 20;
const INPUT_LEVEL_THRESHOLD = -45; //dB
var myChart;
var pitchRaw;
var pitchSmoothed;
var motu;
var meter = new Tone.Meter();
var listening = false;
var debug_text;
var spacebar_keydown_bool = false;
var inputNote = '';
var inputOctave = 0;
var NOTE_NAMES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
var noteBtns = [];

// define graphics variables
const TWO_WIDTH = 1280;
const TWO_HEIGHT = 720;
const CX = TWO_WIDTH/2;
const CY = TWO_HEIGHT/2;
const BLUE = 				'#1481BAFF';
const BLUE_TRANSPARENT = 	'#1481BA50';
const BACKGROUND_COLOR =	'#f3f3f3ff';
const GRAY = 				'rgba(190,190,190,1)';
const LT_GRAY = 			'#f3f3f3';
const TAU = 2*Math.PI;
const SCALE_START_OFFSET_ANGLE = -0.25*TAU;
var two;
var pitchbar;
var inputbar;
var inputmeter;
var noteDial;
var centsDial;

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

    /*pitchbar = two.makeRectangle(CX, CY, 500, 0);
    pitchbar.noStroke();
    pitchbar.fill = BLUE;*/

    /*var baseline = two.makeRectangle(CX, CY, 500, 4);
    baseline.noStroke();
    baseline.fill = 'white';*/

    /*inputbar = two.makeRectangle(CX, CY, 500, 4);
    inputbar.noStroke();
    inputbar.fill = 'red';*/

    // make input meter
    inputmeter = two.makeRectangle(TWO_WIDTH-5, TWO_HEIGHT, 10, 100);
    inputmeter.noStroke();
    inputmeter.fill = '#aaffaa';

    let _y = Util.lerp(TWO_HEIGHT, 0, (100+INPUT_LEVEL_THRESHOLD)/100);
    var inputmeterthreshold = two.makeRectangle(TWO_WIDTH-5, _y, 20, 4);
    inputmeterthreshold.noStroke();
    inputmeterthreshold.fill = 'black';

    // make debug text
    debug_text = two.makeText('', 20, 20);
    debug_text.size = 30;
    debug_text.alignment = 'left';
    debug_text.fill = 'gray';

    // make note buttons
    var angle_offset = SCALE_START_OFFSET_ANGLE;
    for (let i=0; i<NOTE_NAMES.length; i++) {
    	let angle = TAU * (i/NOTE_NAMES.length) + angle_offset;
    	let dist = TWO_HEIGHT/2 - 100;
    	let _x = CX + Util.lengthdirX(angle, dist);
    	let _y = CY + Util.lengthdirY(angle, dist);
    	var btn = makeNoteBtn(_x, _y, NOTE_NAMES[i]);
    	noteBtns.push(btn);
    }

    // make note dial
    var note_dial_r =  TWO_HEIGHT/2 - 180;
    var dial_back = two.makeCircle(0, 0, note_dial_r).noStroke();
    var dial_pointer = two.makePath(note_dial_r-10, 35, note_dial_r-10, -35, note_dial_r+30, 0, false).noStroke();
    dial_pointer.fill = dial_back.fill = GRAY;
    dial_pointer.xscale = 0.5;
    noteDial = two.makeGroup(dial_back, dial_pointer);
    noteDial.translation.set(CX, CY);

    // make cents dial
    var cents_dial_r = note_dial_r/3;
    var cents_dial_back = two.makeCircle(0, 0, cents_dial_r).noStroke();
    var cents_dial_pointer = two.makePath(cents_dial_r-10, 25, cents_dial_r-10, -25, cents_dial_r+20, 0, false).noStroke();
    cents_dial_pointer.fill = cents_dial_back.fill = BLUE;
    centsDial = two.makeGroup(cents_dial_back, cents_dial_pointer);
    centsDial.translation.set(CX, CY);
}

function makeNoteBtn(x, y, note) {
	var r = 40;
	var boundingCircle = two.makeCircle(0, 0, 2*r).noStroke();
	boundingCircle.opacity = 0;
	boundingCircle.fill = BACKGROUND_COLOR; //back-up in case opacity doesn't work

	var back = two.makeCircle(0, 0, r).noStroke();
	back.fill = '#aaaaaa';
	back.opacity = 0;

	var text = two.makeText(note, 0, 2);
	text.family = 'Comfortaa';
    text.size = 30;

    var note_btn = two.makeGroup(boundingCircle, back, text);
    note_btn.translation.set(x, y);
    note_btn.back = back;
	
	Interactions.add(note_btn);
    Interactions.addHover(note_btn,
    	function() { //on_hover
    		TweenHelper.tween(note_btn, {scale: TweenHelper.TWEEN_SCALE_UP}, 200);
    		TweenHelper.tween(back, {opacity: 1}, 200);
    	},
    	function() { //off_hover
			TweenHelper.tween(note_btn, {scale: TweenHelper.TWEEN_SCALE_NORMAL}, 200);
			TweenHelper.tween(back, {opacity: 0}, 200);
    	});

    note_btn.onHighlight = function() {
    	TweenHelper.tween(text, {size: 60}, 200);
    }
    note_btn.onUnhighlight = function() {
    	TweenHelper.tween(text, {size: 30}, 200);
    }

    note_btn.note = note;

    return note_btn;
}

function getNoteBtn(_note) {
	return noteBtns.find(elem => elem.note == _note);
}


var pg_count = 0;
var pg_maxsize = 100; // number of dataPoints visible at any point
function initPitchGraph() {
	var dps = [];
	var ctx = document.getElementById('canvas').getContext('2d');
	myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        type: "line",
	        datasets: [{
	            label: "smoothed pitch",
	            backgroundColor: BLUE,
				borderColor: BLUE,
	            fill: false,
	            data: [],
	        },
	        {
	            label: "raw pitch",
	            backgroundColor: GRAY,
				borderColor: GRAY,
	            fill: false,
	            data: [],
	        }],
	    },
	    options: {
	        scales: {
	            xAxes: [{
	                display: true,
	            }],
	            yAxes: [{
	                display: true,
	                ticks: {precision: 0}
	                //type: 'logarithmic',
	            }]
	        },
	        tooltips: {
		         enabled: false
		    },
		    elements: {
                point:{
                    radius: 0
                }
            }
	    }
	});

	myChart.data.labels = new Array(pg_maxsize);
	myChart.data.datasets.forEach((ds) => {
	        ds.data = new Array(pg_maxsize);
	    });
}

function updatePitchGraph() {
	function addData(chart, label, data) {
	    chart.data.labels.push(label);
	    for (let i=0; i<data.length; i++) {
	    	chart.data.datasets[i].data.push(data[i]);
	    }
    }

	function removeData(chart) {
	    chart.data.labels.shift();
	    chart.data.datasets.forEach((ds) => {
	        ds.data.shift();
    	});
    }

	addData(myChart, pg_count, [pitchSmoothed, pitchRaw]);
    if (pg_count > pg_maxsize) {removeData(myChart);}
    pg_count ++;
    myChart.update();
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

		var processor = Tone.context.createScriptProcessor(2048, 1, 1);
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
	return detectPitch(float32Array); // returns a float, or null if pitch cannot be identified
}

function getPitchNoteOffset(p) {
	//returns the how many Hz the pitch is from the closest note
	let note = Tone.Frequency.ftom(p);
    let note_p = Tone.Frequency.mtof(note);
    let off = p-note_p;
    return off;
}

function getOctaveFromToneNote(tone_note) {
	//tone.js concats a note and an octave, e.g. 'A4'
	return tone_note.replace(/[^0-9]/gi, ''); //remove letters and #/b, leaving the number
}

function getNoteFromToneNote(tone_note) {
	return tone_note.replace(/[0-9]/gi, ''); //remove numbers, leaving the letter
}

function pitchUpdate(pitch_in) {
	if (pitch_in != undefined) {
		pitchRaw = pitch_in;

		// save the pitch into pitch history
		pitchHistory.push(pitch_in);
		if (pitchHistory.length>MAX_PITCH_HISTORY)
			pitchHistory.shift(); //remove oldest recorded pitch
		pitchSmoothed = Util.arrayAverage(pitchHistory);

		// analyze and report the pitch accuracy
	    let off_raw = getPitchNoteOffset(pitch_in);
	    let off_smoothed = getPitchNoteOffset(pitchSmoothed);
		let note = Tone.Frequency(Tone.Frequency.ftom(pitch_in), "midi").toNote();

		debugTextAdd(Math.round(pitch_in) + ' Hz');
		debugTextAdd(note);
		debugTextAdd(off_raw);

		let _temp_note = getNoteFromToneNote(note);
		let _temp_oct = getOctaveFromToneNote(note);

		if (_temp_note != inputNote) {
			let old_btn = getNoteBtn(inputNote)
			if (old_btn != undefined) { old_btn.onUnhighlight(); }
			let new_btn = getNoteBtn(_temp_note)
			if (new_btn != undefined) { new_btn.onHighlight(); }
		}

		inputNote = _temp_note;
		inputOctave = _temp_oct;

		// update visuals
		/*let scale = -60;
	    pitchbar.vertices[0].y = pitchbar.vertices[1].y = scale*off_smoothed;
	    inputbar.translation.y = CY+scale*off_raw;*/

	    let precise_octave = Math.log2(pitchSmoothed/Tone.Frequency.A4) + 1;
	    noteDial.rotation = precise_octave*TAU + SCALE_START_OFFSET_ANGLE;

	    centsDial.rotation = off_smoothed + SCALE_START_OFFSET_ANGLE;
	}

	//pitchbar.fill = (meter.getLevel() < -40) ? BLUE_TRANSPARENT : BLUE;
	inputmeter.vertices[0].y = inputmeter.vertices[1].y = -Util.lerp(0, TWO_HEIGHT, (100+meter.getLevel())/100);
}

function setInputListening(active) {
	active ? motu.open() : motu.close();
	listening = active;
}

function init() {
	initGraphics();
	initAudioBuffer();
	initPitchGraph();
}

function debugUpdate() {
	//use spacebar to toggle listening
	$(window).keydown(function(e) {
    	if (e.which === 32 && !spacebar_keydown_bool) { //spacebar
    		setInputListening(!listening);
    		spacebar_keydown_bool = true;
    	}
	});

	$(window).keyup(function(e) {
		if (e.which === 32) {//spacebar
			spacebar_keydown_bool = false;
		}
	});

	debugTextAdd(listening ? 'listening (toggle with SPACEBAR)' : 'not listening (toggle with SPACEBAR)');
}

function debugTextAdd(text) {
	var elem = document.getElementById("test");
	if (elem != undefined) {elem.innerHTML += text + '<br/>';}
}

function debugTextClear() {
	var elem = document.getElementById("test");
	if (elem != undefined) {elem.innerHTML = '';}
}

// Our main update loop!
function update() {
	
	debugTextClear();
	debugUpdate();

	pitchUpdate(getPitchFromAudio());
	updatePitchGraph();

    two.update();
    TWEEN.update();
	
    //if (meter != undefined)	console.log(meter.getLevel());

    // Ask the browser to run this on the next frame please   「 次のフラムをください。」
    requestAnimationFrame( update );
}

window.onload = function() {
	init();
	update();
}