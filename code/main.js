/*const Pitchfinder = require("pitchfinder");
const detectPitch = Pitchfinder.AMDF();

// from https://developers.google.com/web/fundamentals/media/recording-audio/
function getAudioBuffer() {
	var handleSuccess = function(stream) {
	    var context = new AudioContext();
	    var source = context.createMediaStreamSource(stream);
	    var processor = context.createScriptProcessor(1024, 1, 1);

	    source.connect(processor);
	    processor.connect(context.destination);

	    processor.onaudioprocess = function(e) {
	      // Do something with the data, i.e Convert this to WAV
	      console.log(e.inputBuffer);
	    };
	  };

  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);
}

//from https://github.com/peterkhayes/pitchfinder
const myAudioBuffer = getAudioBuffer(); // assume this returns a WebAudio AudioBuffer object
const float32Array = myAudioBuffer.getChannelData(0); // get a single channel of sound
const pitch = detectPitch(float32Array); // null if pitch cannot be identified
*/

console.log("Hello webpack. Demo works");