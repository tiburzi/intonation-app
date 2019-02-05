const Pitchfinder = require("pitchfinder");
const detectPitch = Pitchfinder.AMDF();
var audioInputBuffer = null;

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
	initAudioBuffer();
}

// Our main update loop!
function update() {

    let pitch_precise = getPitchFromAudio();
    if (pitch_precise != undefined) {
    	let pitch_display = Math.round(pitch_precise) + ' Hz';
    	document.getElementById("test").innerHTML = pitch_display;
    }

    // Ask the browser to run this on the next frame please   「 次のフラムをください。」
    requestAnimationFrame( update );
}

init();
update();