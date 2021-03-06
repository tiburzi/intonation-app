const Pitchfinder = require("pitchfinder");
const Tone = require("tone");

// define audio variables
const detectPitch = Pitchfinder.DynamicWavelet();
var audioInputBuffer = null;
const INPUT_LEVEL_THRESHOLD = -45; //dB
var myChart;
var pitchRaw;
var pitchRawHistory = [];
var pitchSmooth;
var pitchSmoothHistory = [];
var sd = 0;
var new_pitch_count = 0;
var motu;
var meter = new Tone.Meter();
var listening = false;
var show_debug = true;
var debug_text;
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
const GOLD =				'#EEC72C';
const TAU = 2*Math.PI;
const SCALE_START_OFFSET_ANGLE = -0.25*TAU;
var two;
var pitchbar;
var inputbar;
var inputmeter;
var noteDial;
var centsDial;
var centsArc;

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

    var rUnit = (TWO_HEIGHT - 180)/16;

    // make note dial
    var note_dial_r = 6*rUnit;
    var dial_back = two.makeCircle(0, 0, note_dial_r).noStroke();
    var dial_pointer = two.makePath(note_dial_r-10, 35, note_dial_r-10, -35, note_dial_r+30, 0, false).noStroke();
    dial_pointer.fill = dial_back.fill = GRAY;
    dial_pointer.xscale = 0.5;
    noteDial = two.makeGroup(dial_back, dial_pointer);
    noteDial.translation.set(CX, CY);

    //make arc path
    var start_angle = -Math.PI/2; //in radians
    var end_angle = start_angle; //in radians
    centsArc = two.makeArcSegment(0, 0, 2*rUnit, 5*rUnit, start_angle, end_angle);
    centsArc.noStroke();
    centsArc.fill = BLUE_TRANSPARENT;
    centsArc.translation.set(CX, CY);

    // make cents dial
    var cents_dial_r = 2*rUnit;
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
var pg_maxsize = 60; // number of dataPoints visible at any point
function initPitchGraph() {
	var dps = [];
	var ctx = document.getElementById('pitch-graph').getContext('2d');
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
	        },
	        {
	            label: "standard deviation",
	            backgroundColor: GOLD,
				borderColor: GOLD,
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
	    },
	    responsive: false,
	    height: 200,
	    width: 200,
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

	addData(myChart, pg_count, [pitchSmooth, pitchRaw, pitchSmooth+sd]);
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

function pitchUpdate() {
	smoothPitch();

	// analyze and report the pitch accuracy
    let off_raw = getPitchNoteOffset(pitchRaw);
    let off_smoothed = getPitchNoteOffset(pitchSmooth);
	let note = Tone.Frequency(Tone.Frequency.ftom(pitchRaw), "midi").toNote();
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

	//Update visuals
    let precise_octave = Math.log2(pitchSmooth/Tone.Frequency.A4) + 1;
    if (precise_octave) //if it's defined
    	noteDial.rotation = precise_octave*TAU + SCALE_START_OFFSET_ANGLE;

    if (off_smoothed) //if it's defined
    {
		centsDial.rotation = off_smoothed + SCALE_START_OFFSET_ANGLE;
		centsArc.endAngle = centsDial.rotation;
	}

	var lvl = meter.getLevel();
	if (lvl && lvl != -Infinity) //if it's defined and a "normal, draw-able" value
		inputmeter.vertices[0].y = inputmeter.vertices[1].y = -Util.lerp(0, TWO_HEIGHT, (100+lvl)/100);
}

function smoothPitch() {
	
	const MAX_HISTORY = 50;
	const NEW_PITCH_THRESHOLD = 10; //samples? frames? who knows...
	if (!pitchSmooth) {pitchSmooth = pitchRaw;} //initial condition

	// Record raw history
	Util.finiteArrayPush(pitchRawHistory, pitchRaw, MAX_HISTORY);
	var raw_average = Util.arrayAverage(pitchRawHistory);
	
	// More accurately detect pitch movement by filtering out blips and glitches
	if (Math.abs(pitchRaw-pitchSmooth) > sd)
		new_pitch_count++;
	else new_pitch_count = 0;

	// If raw pitch is within a standard deviation, use it. Otherwise, we ignore it. Also check if we're moving to a new pitch
	if (Math.abs(pitchRaw-pitchSmooth) < sd || new_pitch_count > NEW_PITCH_THRESHOLD)
	{
		// Exponential Smoothing method
		const alpha = 0.2; //smoothing amount (low = stronger smoothing but less responsive)
		pitchSmooth = pitchRaw*alpha + (1-alpha)*pitchSmooth;

		// Record smooth history
		Util.finiteArrayPush(pitchSmoothHistory, pitchSmooth, MAX_HISTORY);

		// Update standard deviation
		sd = Util.standardDeviation(pitchSmoothHistory);
	}
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

	//detect debugging keypresses
	document.onkeypress = function (e) {
	    e = e || window.event;
	    if (e.keyCode == 13) //enter key
	    	setInputListening(!listening);
	    if (e.keyCode == 32) //spacebar
	    	show_debug = !show_debug;
	};

	debugTextClear();
	if (show_debug) {
		let off_raw = getPitchNoteOffset(pitchRaw);
		let note = Tone.Frequency(Tone.Frequency.ftom(pitchRaw), "midi").toNote();
		debugTextAdd(listening ? 'listening (toggle with ENTER)' : 'not listening (toggle with ENTER)');
		debugTextAdd(Math.round(pitchRaw) + ' Hz');
		debugTextAdd(note);
		debugTextAdd(off_raw);

		updatePitchGraph();
		$("#canvas").show();
	} else {
		$("#canvas").hide();
	}
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
	
	debugUpdate();

	pitchRaw = getPitchFromAudio() || pitchRaw; //don't overwrite if pitch == null
	pitchUpdate();

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