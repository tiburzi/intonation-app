const Pitchfinder = require("pitchfinder");
const Tone = require("tone");

const detectPitch = Pitchfinder.AMDF();
var audioInputBuffer = null;
var two;

function initGraphics() {
	// initialize Two.js here
    var TWO_WIDTH = 1280;
    var TWO_HEIGHT = 720;

     // Make an instance of two and place it on the page
    var elem = document.getElementById('main-container');
    var params = { fullscreen: false, width: TWO_WIDTH, height: TWO_HEIGHT };
    two = new Two(params).appendTo(elem);
    
    two.renderer.domElement.setAttribute("viewBox", "0 0 " + String(TWO_WIDTH) + " " + String(TWO_HEIGHT));
    two.renderer.domElement.removeAttribute("width");
    two.renderer.domElement.removeAttribute("height");
}

function initAudioBuffer() {
	// from https://developers.google.com/web/fundamentals/media/recording-audio/
	var handleSuccess = function(stream) {
	    var context = new AudioContext();
	    var source = context.createMediaStreamSource(stream);
	    var processor = context.createScriptProcessor(1024, 1, 1);

	    source.connect(processor);
	    processor.connect(context.destination);

	    processor.onaudioprocess = function(e) {
	      // Do something with the data, i.e Convert this to WAV
	      //console.log(e.inputBuffer);
	      audioInputBuffer = e.inputBuffer; //save the audio buffer (is there a better way to do this?)
	    };
	  };

  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);
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

function init() {
	initGraphics();
	initAudioBuffer();
}

// Our main update loop!
function update() {

    let pitch_precise = getPitchFromAudio();
    let note_rounded = Tone.Frequency.ftom(pitch_precise);
    let pitch_rounded = Tone.Frequency.mtof(note_rounded);
    let pitch_note_offset = pitch_precise-pitch_rounded;

    if (pitch_precise != undefined) {
    	let pitch_display = Math.round(pitch_precise) + ' Hz';
    	pitch_display += '<br/>'+Tone.Frequency(note_rounded, "midi").toNote()+'<br/>'+pitch_note_offset;
    	document.getElementById("test").innerHTML = pitch_display;
    }

    two.update();

    // Ask the browser to run this on the next frame please   「 次のフラムをください。」
    requestAnimationFrame( update );
}

init();
update();