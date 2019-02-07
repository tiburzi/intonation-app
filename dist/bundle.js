/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const Pitchfinder = __webpack_require__(/*! pitchfinder */ \"./node_modules/pitchfinder/index.js\");\r\n\r\nconst detectPitch = Pitchfinder.AMDF();\r\nvar audioInputBuffer = null;\r\n\r\nfunction initGraphics() {\r\n\t// initialize Two.js here\r\n    var TWO_WIDTH = 1280;\r\n    var TWO_HEIGHT = 720;\r\n\r\n     // Make an instance of two and place it on the page\r\n    var elem = document.getElementById('main-container');\r\n    var params = { fullscreen: false, width: TWO_WIDTH, height: TWO_HEIGHT };\r\n    var two = new Two(params).appendTo(elem);\r\n    \r\n    two.renderer.domElement.setAttribute(\"viewBox\", \"0 0 \" + String(TWO_WIDTH) + \" \" + String(TWO_HEIGHT));\r\n    two.renderer.domElement.removeAttribute(\"width\");\r\n    two.renderer.domElement.removeAttribute(\"height\");\r\n}\r\n\r\nfunction initAudioBuffer() {\r\n\t// from https://developers.google.com/web/fundamentals/media/recording-audio/\r\n\tvar handleSuccess = function(stream) {\r\n\t    var context = new AudioContext();\r\n\t    var source = context.createMediaStreamSource(stream);\r\n\t    var processor = context.createScriptProcessor(1024, 1, 1);\r\n\r\n\t    source.connect(processor);\r\n\t    processor.connect(context.destination);\r\n\r\n\t    processor.onaudioprocess = function(e) {\r\n\t      // Do something with the data, i.e Convert this to WAV\r\n\t      //console.log(e.inputBuffer);\r\n\t      audioInputBuffer = e.inputBuffer; //save the audio buffer (is there a better way to do this?)\r\n\t    };\r\n\t  };\r\n\r\n  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);\r\n}\r\n\r\nfunction getAudioBuffer() {\r\n\treturn audioInputBuffer;\r\n}\r\n\r\nfunction getPitchFromAudio() {\r\n\t//from https://github.com/peterkhayes/pitchfinder\r\n\tconst myAudioBuffer = getAudioBuffer(); // assume this returns a WebAudio AudioBuffer object\r\n\tif (myAudioBuffer == null) {return undefined};\r\n\tconst float32Array = myAudioBuffer.getChannelData(0); // get a single channel of sound\r\n\treturn detectPitch(float32Array); // null if pitch cannot be identified\r\n}\r\n\r\nfunction init() {\r\n\tinitGraphics();\r\n\tinitAudioBuffer();\r\n}\r\n\r\n// Our main update loop!\r\nfunction update() {\r\n\r\n    let pitch_precise = getPitchFromAudio();\r\n    if (pitch_precise != undefined) {\r\n    \tlet pitch_display = Math.round(pitch_precise) + ' Hz';\r\n    \tdocument.getElementById(\"test\").innerHTML = pitch_display;\r\n    }\r\n\r\n    // Ask the browser to run this on the next frame please   「 次のフラムをください。」\r\n    requestAnimationFrame( update );\r\n}\r\n\r\ninit();\r\nupdate();\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/index.js":
/*!*******************************************!*\
  !*** ./node_modules/pitchfinder/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./lib */ \"./node_modules/pitchfinder/lib/index.js\");\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/index.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/detectors/amdf.js":
/*!********************************************************!*\
  !*** ./node_modules/pitchfinder/lib/detectors/amdf.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar DEFAULT_MIN_FREQUENCY = 82;\nvar DEFAULT_MAX_FREQUENCY = 1000;\nvar DEFAULT_RATIO = 5;\nvar DEFAULT_SENSITIVITY = 0.1;\nvar DEFAULT_SAMPLE_RATE = 44100;\n\nmodule.exports = function () {\n  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n\n\n  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;\n  var minFrequency = config.minFrequency || DEFAULT_MIN_FREQUENCY;\n  var maxFrequency = config.maxFrequency || DEFAULT_MAX_FREQUENCY;\n  var sensitivity = config.sensitivity || DEFAULT_SENSITIVITY;\n  var ratio = config.ratio || DEFAULT_RATIO;\n  var amd = [];\n  var maxPeriod = Math.round(sampleRate / minFrequency + 0.5);\n  var minPeriod = Math.round(sampleRate / maxFrequency + 0.5);\n\n  return function AMDFDetector(float32AudioBuffer) {\n    \"use strict\";\n\n    var maxShift = float32AudioBuffer.length;\n\n    var t = 0;\n    var minval = Infinity;\n    var maxval = -Infinity;\n    var frames1 = void 0,\n        frames2 = void 0,\n        calcSub = void 0,\n        i = void 0,\n        j = void 0,\n        u = void 0,\n        aux1 = void 0,\n        aux2 = void 0;\n\n    // Find the average magnitude difference for each possible period offset.\n    for (i = 0; i < maxShift; i++) {\n      if (minPeriod <= i && i <= maxPeriod) {\n        for (aux1 = 0, aux2 = i, t = 0, frames1 = [], frames2 = []; aux1 < maxShift - i; t++, aux2++, aux1++) {\n          frames1[t] = float32AudioBuffer[aux1];\n          frames2[t] = float32AudioBuffer[aux2];\n        }\n\n        // Take the difference between these frames.\n        var frameLength = frames1.length;\n        calcSub = [];\n        for (u = 0; u < frameLength; u++) {\n          calcSub[u] = frames1[u] - frames2[u];\n        }\n\n        // Sum the differences.\n        var summation = 0;\n        for (u = 0; u < frameLength; u++) {\n          summation += Math.abs(calcSub[u]);\n        }\n        amd[i] = summation;\n      }\n    }\n\n    for (j = minPeriod; j < maxPeriod; j++) {\n      if (amd[j] < minval) minval = amd[j];\n      if (amd[j] > maxval) maxval = amd[j];\n    }\n\n    var cutoff = Math.round(sensitivity * (maxval - minval) + minval);\n    for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++) {}\n\n    var search_length = minPeriod / 2;\n    minval = amd[j];\n    var minpos = j;\n    for (i = j - 1; i < j + search_length && i <= maxPeriod; i++) {\n      if (amd[i] < minval) {\n        minval = amd[i];\n        minpos = i;\n      }\n    }\n\n    if (Math.round(amd[minpos] * ratio) < maxval) {\n      return sampleRate / minpos;\n    } else {\n      return null;\n    }\n  };\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/detectors/amdf.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/detectors/dynamic_wavelet.js":
/*!*******************************************************************!*\
  !*** ./node_modules/pitchfinder/lib/detectors/dynamic_wavelet.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar DEFAULT_SAMPLE_RATE = 44100;\nvar MAX_FLWT_LEVELS = 6;\nvar MAX_F = 3000;\nvar DIFFERENCE_LEVELS_N = 3;\nvar MAXIMA_THRESHOLD_RATIO = 0.75;\n\nmodule.exports = function () {\n  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n\n\n  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;\n\n  return function DynamicWaveletDetector(float32AudioBuffer) {\n    \"use strict\";\n\n    var mins = [];\n    var maxs = [];\n    var bufferLength = float32AudioBuffer.length;\n\n    var freq = null;\n    var theDC = 0;\n    var minValue = 0;\n    var maxValue = 0;\n\n    // Compute max amplitude, amplitude threshold, and the DC.\n    for (var i = 0; i < bufferLength; i++) {\n      var sample = float32AudioBuffer[i];\n      theDC = theDC + sample;\n      maxValue = Math.max(maxValue, sample);\n      minValue = Math.min(minValue, sample);\n    }\n\n    theDC /= bufferLength;\n    minValue -= theDC;\n    maxValue -= theDC;\n    var amplitudeMax = maxValue > -1 * minValue ? maxValue : -1 * minValue;\n    var amplitudeThreshold = amplitudeMax * MAXIMA_THRESHOLD_RATIO;\n\n    // levels, start without downsampling...\n    var curLevel = 0;\n    var curModeDistance = -1;\n    var curSamNb = float32AudioBuffer.length;\n    var delta = void 0,\n        nbMaxs = void 0,\n        nbMins = void 0;\n\n    // Search:\n    while (true) {\n      delta = ~~(sampleRate / (Math.pow(2, curLevel) * MAX_F));\n      if (curSamNb < 2) break;\n\n      var dv = void 0;\n      var previousDV = -1000;\n      var lastMinIndex = -1000000;\n      var lastMaxIndex = -1000000;\n      var findMax = false;\n      var findMin = false;\n\n      nbMins = 0;\n      nbMaxs = 0;\n\n      for (var _i = 2; _i < curSamNb; _i++) {\n        var si = float32AudioBuffer[_i] - theDC;\n        var si1 = float32AudioBuffer[_i - 1] - theDC;\n\n        if (si1 <= 0 && si > 0) findMax = true;\n        if (si1 >= 0 && si < 0) findMin = true;\n\n        // min or max ?\n        dv = si - si1;\n\n        if (previousDV > -1000) {\n          if (findMin && previousDV < 0 && dv >= 0) {\n            // minimum\n            if (Math.abs(si) >= amplitudeThreshold) {\n              if (_i > lastMinIndex + delta) {\n                mins[nbMins++] = _i;\n                lastMinIndex = _i;\n                findMin = false;\n              }\n            }\n          }\n\n          if (findMax && previousDV > 0 && dv <= 0) {\n            // maximum\n            if (Math.abs(si) >= amplitudeThreshold) {\n              if (_i > lastMaxIndex + delta) {\n                maxs[nbMaxs++] = _i;\n                lastMaxIndex = _i;\n                findMax = false;\n              }\n            }\n          }\n        }\n        previousDV = dv;\n      }\n\n      if (nbMins === 0 && nbMaxs === 0) {\n        // No best distance found!\n        break;\n      }\n\n      var d = void 0;\n      var distances = [];\n\n      for (var _i2 = 0; _i2 < curSamNb; _i2++) {\n        distances[_i2] = 0;\n      }\n\n      for (var _i3 = 0; _i3 < nbMins; _i3++) {\n        for (var j = 1; j < DIFFERENCE_LEVELS_N; j++) {\n          if (_i3 + j < nbMins) {\n            d = Math.abs(mins[_i3] - mins[_i3 + j]);\n            distances[d] += 1;\n          }\n        }\n      }\n\n      var bestDistance = -1;\n      var bestValue = -1;\n\n      for (var _i4 = 0; _i4 < curSamNb; _i4++) {\n        var summed = 0;\n        for (var _j = -1 * delta; _j <= delta; _j++) {\n          if (_i4 + _j >= 0 && _i4 + _j < curSamNb) {\n            summed += distances[_i4 + _j];\n          }\n        }\n\n        if (summed === bestValue) {\n          if (_i4 === 2 * bestDistance) {\n            bestDistance = _i4;\n          }\n        } else if (summed > bestValue) {\n          bestValue = summed;\n          bestDistance = _i4;\n        }\n      }\n\n      // averaging\n      var distAvg = 0;\n      var nbDists = 0;\n      for (var _j2 = -delta; _j2 <= delta; _j2++) {\n        if (bestDistance + _j2 >= 0 && bestDistance + _j2 < bufferLength) {\n          var nbDist = distances[bestDistance + _j2];\n          if (nbDist > 0) {\n            nbDists += nbDist;\n            distAvg += (bestDistance + _j2) * nbDist;\n          }\n        }\n      }\n\n      // This is our mode distance.\n      distAvg /= nbDists;\n\n      // Continue the levels?\n      if (curModeDistance > -1) {\n        if (Math.abs(distAvg * 2 - curModeDistance) <= 2 * delta) {\n          // two consecutive similar mode distances : ok !\n          freq = sampleRate / (Math.pow(2, curLevel - 1) * curModeDistance);\n          break;\n        }\n      }\n\n      // not similar, continue next level;\n      curModeDistance = distAvg;\n\n      curLevel++;\n      if (curLevel >= MAX_FLWT_LEVELS || curSamNb < 2) {\n        break;\n      }\n\n      //do not modify original audio buffer, make a copy buffer, if\n      //downsampling is needed (only once).\n      var newFloat32AudioBuffer = float32AudioBuffer.subarray(0);\n      if (curSamNb === distances.length) {\n        newFloat32AudioBuffer = new Float32Array(curSamNb / 2);\n      }\n      for (var _i5 = 0; _i5 < curSamNb / 2; _i5++) {\n        newFloat32AudioBuffer[_i5] = (float32AudioBuffer[2 * _i5] + float32AudioBuffer[2 * _i5 + 1]) / 2;\n      }\n      float32AudioBuffer = newFloat32AudioBuffer;\n      curSamNb /= 2;\n    }\n\n    return freq;\n  };\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/detectors/dynamic_wavelet.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/detectors/macleod.js":
/*!***********************************************************!*\
  !*** ./node_modules/pitchfinder/lib/detectors/macleod.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (config) {\n\n  config = config || {};\n\n  /**\n   * The expected size of an audio buffer (in samples).\n   */\n  var DEFAULT_BUFFER_SIZE = 1024;\n\n  /**\n   * Defines the relative size the chosen peak (pitch) has. 0.93 means: choose\n   * the first peak that is higher than 93% of the highest peak detected. 93%\n   * is the default value used in the Tartini user interface.\n   */\n  var DEFAULT_CUTOFF = 0.97;\n\n  var DEFAULT_SAMPLE_RATE = 44100;\n\n  /**\n   * For performance reasons, peaks below this cutoff are not even considered.\n   */\n  var SMALL_CUTOFF = 0.5;\n\n  /**\n   * Pitch annotations below this threshold are considered invalid, they are\n   * ignored.\n   */\n  var LOWER_PITCH_CUTOFF = 80;\n\n  /**\n   * Defines the relative size the chosen peak (pitch) has.\n   */\n  var cutoff = config.cutoff || DEFAULT_CUTOFF;\n\n  /**\n   * The audio sample rate. Most audio has a sample rate of 44.1kHz.\n   */\n  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;\n\n  /**\n   * Size of the input buffer.\n   */\n  var bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE;\n\n  /**\n   * Contains a normalized square difference function value for each delay\n   * (tau).\n   */\n  var nsdf = new Float32Array(bufferSize);\n\n  /**\n   * The x and y coordinate of the top of the curve (nsdf).\n   */\n  var turningPointX = void 0;\n  var turningPointY = void 0;\n\n  /**\n   * A list with minimum and maximum values of the nsdf curve.\n   */\n  var maxPositions = [];\n\n  /**\n   * A list of estimates of the period of the signal (in samples).\n   */\n  var periodEstimates = [];\n\n  /**\n   * A list of estimates of the amplitudes corresponding with the period\n   * estimates.\n   */\n  var ampEstimates = [];\n\n  /**\n   * The result of the pitch detection iteration.\n   */\n  var result = {};\n\n  /**\n   * Implements the normalized square difference function. See section 4 (and\n   * the explanation before) in the MPM article. This calculation can be\n   * optimized by using an FFT. The results should remain the same.\n   */\n  var normalizedSquareDifference = function normalizedSquareDifference(float32AudioBuffer) {\n    for (var tau = 0; tau < float32AudioBuffer.length; tau++) {\n      var acf = 0;\n      var divisorM = 0;\n      for (var i = 0; i < float32AudioBuffer.length - tau; i++) {\n        acf += float32AudioBuffer[i] * float32AudioBuffer[i + tau];\n        divisorM += float32AudioBuffer[i] * float32AudioBuffer[i] + float32AudioBuffer[i + tau] * float32AudioBuffer[i + tau];\n      }\n      nsdf[tau] = 2 * acf / divisorM;\n    }\n  };\n\n  /**\n   * Finds the x value corresponding with the peak of a parabola.\n   * Interpolates between three consecutive points centered on tau.\n   */\n  var parabolicInterpolation = function parabolicInterpolation(tau) {\n    var nsdfa = nsdf[tau - 1],\n        nsdfb = nsdf[tau],\n        nsdfc = nsdf[tau + 1],\n        bValue = tau,\n        bottom = nsdfc + nsdfa - 2 * nsdfb;\n    if (bottom === 0) {\n      turningPointX = bValue;\n      turningPointY = nsdfb;\n    } else {\n      var delta = nsdfa - nsdfc;\n      turningPointX = bValue + delta / (2 * bottom);\n      turningPointY = nsdfb - delta * delta / (8 * bottom);\n    }\n  };\n\n  // Finds the highest value between each pair of positive zero crossings.\n  var peakPicking = function peakPicking() {\n    var pos = 0;\n    var curMaxPos = 0;\n\n    // find the first negative zero crossing.\n    while (pos < (nsdf.length - 1) / 3 && nsdf[pos] > 0) {\n      pos++;\n    }\n\n    // loop over all the values below zero.\n    while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {\n      pos++;\n    }\n\n    // can happen if output[0] is NAN\n    if (pos == 0) {\n      pos = 1;\n    }\n\n    while (pos < nsdf.length - 1) {\n      if (nsdf[pos] > nsdf[pos - 1] && nsdf[pos] >= nsdf[pos + 1]) {\n        if (curMaxPos == 0) {\n          // the first max (between zero crossings)\n          curMaxPos = pos;\n        } else if (nsdf[pos] > nsdf[curMaxPos]) {\n          // a higher max (between the zero crossings)\n          curMaxPos = pos;\n        }\n      }\n      pos++;\n      // a negative zero crossing\n      if (pos < nsdf.length - 1 && nsdf[pos] <= 0) {\n        // if there was a maximum add it to the list of maxima\n        if (curMaxPos > 0) {\n          maxPositions.push(curMaxPos);\n          curMaxPos = 0; // clear the maximum position, so we start\n          // looking for a new ones\n        }\n        while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {\n          pos++; // loop over all the values below zero\n        }\n      }\n    }\n    if (curMaxPos > 0) {\n      maxPositions.push(curMaxPos);\n    }\n  };\n\n  return function (float32AudioBuffer) {\n\n    // 0. Clear old results.\n    var pitch = void 0;\n    maxPositions = [];\n    periodEstimates = [];\n    ampEstimates = [];\n\n    // 1. Calculute the normalized square difference for each Tau value.\n    normalizedSquareDifference(float32AudioBuffer);\n    // 2. Peak picking time: time to pick some peaks.\n    peakPicking();\n\n    var highestAmplitude = -Infinity;\n\n    for (var i = 0; i < maxPositions.length; i++) {\n      var tau = maxPositions[i];\n      // make sure every annotation has a probability attached\n      highestAmplitude = Math.max(highestAmplitude, nsdf[tau]);\n\n      if (nsdf[tau] > SMALL_CUTOFF) {\n        // calculates turningPointX and Y\n        parabolicInterpolation(tau);\n        // store the turning points\n        ampEstimates.push(turningPointY);\n        periodEstimates.push(turningPointX);\n        // remember the highest amplitude\n        highestAmplitude = Math.max(highestAmplitude, turningPointY);\n      }\n    }\n\n    if (periodEstimates.length) {\n      // use the overall maximum to calculate a cutoff.\n      // The cutoff value is based on the highest value and a relative\n      // threshold.\n      var actualCutoff = cutoff * highestAmplitude;\n      var periodIndex = 0;\n\n      for (var _i = 0; _i < ampEstimates.length; _i++) {\n        if (ampEstimates[_i] >= actualCutoff) {\n          periodIndex = _i;\n          break;\n        }\n      }\n\n      var period = periodEstimates[periodIndex],\n          pitchEstimate = sampleRate / period;\n\n      if (pitchEstimate > LOWER_PITCH_CUTOFF) {\n        pitch = pitchEstimate;\n      } else {\n        pitch = -1;\n      }\n    } else {\n      // no pitch detected.\n      pitch = -1;\n    }\n\n    result.probability = highestAmplitude;\n    result.freq = pitch;\n    return result;\n  };\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/detectors/macleod.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/detectors/yin.js":
/*!*******************************************************!*\
  !*** ./node_modules/pitchfinder/lib/detectors/yin.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/*\n  Copyright (C) 2003-2009 Paul Brossier <piem@aubio.org>\n  This file is part of aubio.\n  aubio is free software: you can redistribute it and/or modify\n  it under the terms of the GNU General Public License as published by\n  the Free Software Foundation, either version 3 of the License, or\n  (at your option) any later version.\n  aubio is distributed in the hope that it will be useful,\n  but WITHOUT ANY WARRANTY; without even the implied warranty of\n  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n  GNU General Public License for more details.\n  You should have received a copy of the GNU General Public License\n  along with aubio.  If not, see <http://www.gnu.org/licenses/>.\n*/\n\n/* This algorithm was developed by A. de Cheveigné and H. Kawahara and\n * published in:\n * \n * de Cheveigné, A., Kawahara, H. (2002) \"YIN, a fundamental frequency\n * estimator for speech and music\", J. Acoust. Soc. Am. 111, 1917-1930.  \n *\n * see http://recherche.ircam.fr/equipes/pcm/pub/people/cheveign.html\n */\n\nvar DEFAULT_THRESHOLD = 0.10;\nvar DEFAULT_SAMPLE_RATE = 44100;\nvar DEFAULT_PROBABILITY_THRESHOLD = 0.1;\n\nmodule.exports = function () {\n  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n\n\n  var threshold = config.threshold || DEFAULT_THRESHOLD;\n  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;\n  var probabilityThreshold = config.probabilityThreshold || DEFAULT_PROBABILITY_THRESHOLD;\n\n  return function YINDetector(float32AudioBuffer) {\n    \"use strict\";\n\n    // Set buffer size to the highest power of two below the provided buffer's length.\n\n    var bufferSize = void 0;\n    for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2) {}\n    bufferSize /= 2;\n\n    // Set up the yinBuffer as described in step one of the YIN paper.\n    var yinBufferLength = bufferSize / 2;\n    var yinBuffer = new Float32Array(yinBufferLength);\n\n    var probability = void 0,\n        tau = void 0;\n\n    // Compute the difference function as described in step 2 of the YIN paper.\n    for (var t = 0; t < yinBufferLength; t++) {\n      yinBuffer[t] = 0;\n    }\n    for (var _t = 1; _t < yinBufferLength; _t++) {\n      for (var i = 0; i < yinBufferLength; i++) {\n        var delta = float32AudioBuffer[i] - float32AudioBuffer[i + _t];\n        yinBuffer[_t] += delta * delta;\n      }\n    }\n\n    // Compute the cumulative mean normalized difference as described in step 3 of the paper.\n    yinBuffer[0] = 1;\n    yinBuffer[1] = 1;\n    var runningSum = 0;\n    for (var _t2 = 1; _t2 < yinBufferLength; _t2++) {\n      runningSum += yinBuffer[_t2];\n      yinBuffer[_t2] *= _t2 / runningSum;\n    }\n\n    // Compute the absolute threshold as described in step 4 of the paper.\n    // Since the first two positions in the array are 1,\n    // we can start at the third position.\n    for (tau = 2; tau < yinBufferLength; tau++) {\n      if (yinBuffer[tau] < threshold) {\n        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {\n          tau++;\n        }\n        // found tau, exit loop and return\n        // store the probability\n        // From the YIN paper: The threshold determines the list of\n        // candidates admitted to the set, and can be interpreted as the\n        // proportion of aperiodic power tolerated\n        // within a periodic signal.\n        //\n        // Since we want the periodicity and and not aperiodicity:\n        // periodicity = 1 - aperiodicity\n        probability = 1 - yinBuffer[tau];\n        break;\n      }\n    }\n\n    // if no pitch found, return null.\n    if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {\n      return null;\n    }\n\n    // If probability too low, return -1.\n    if (probability < probabilityThreshold) {\n      return null;\n    }\n\n    /**\n     * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau\n     * value using parabolic interpolation. This is needed to detect higher\n     * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and\n     * for more background\n     * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html\n     */\n    var betterTau = void 0,\n        x0 = void 0,\n        x2 = void 0;\n    if (tau < 1) {\n      x0 = tau;\n    } else {\n      x0 = tau - 1;\n    }\n    if (tau + 1 < yinBufferLength) {\n      x2 = tau + 1;\n    } else {\n      x2 = tau;\n    }\n    if (x0 === tau) {\n      if (yinBuffer[tau] <= yinBuffer[x2]) {\n        betterTau = tau;\n      } else {\n        betterTau = x2;\n      }\n    } else if (x2 === tau) {\n      if (yinBuffer[tau] <= yinBuffer[x0]) {\n        betterTau = tau;\n      } else {\n        betterTau = x0;\n      }\n    } else {\n      var s0 = yinBuffer[x0];\n      var s1 = yinBuffer[tau];\n      var s2 = yinBuffer[x2];\n      // fixed AUBIO implementation, thanks to Karl Helgason:\n      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1\n      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));\n    }\n\n    return sampleRate / betterTau;\n  };\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/detectors/yin.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/index.js":
/*!***********************************************!*\
  !*** ./node_modules/pitchfinder/lib/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar AMDF = __webpack_require__(/*! ./detectors/amdf */ \"./node_modules/pitchfinder/lib/detectors/amdf.js\");\nvar YIN = __webpack_require__(/*! ./detectors/yin */ \"./node_modules/pitchfinder/lib/detectors/yin.js\");\nvar DynamicWavelet = __webpack_require__(/*! ./detectors/dynamic_wavelet */ \"./node_modules/pitchfinder/lib/detectors/dynamic_wavelet.js\");\nvar Macleod = __webpack_require__(/*! ./detectors/macleod */ \"./node_modules/pitchfinder/lib/detectors/macleod.js\");\n\nvar frequencies = __webpack_require__(/*! ./tools/frequencies */ \"./node_modules/pitchfinder/lib/tools/frequencies.js\");\n\nmodule.exports = {\n  AMDF: AMDF,\n  YIN: YIN,\n  DynamicWavelet: DynamicWavelet,\n  Macleod: Macleod,\n  frequencies: frequencies\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/index.js?");

/***/ }),

/***/ "./node_modules/pitchfinder/lib/tools/frequencies.js":
/*!***********************************************************!*\
  !*** ./node_modules/pitchfinder/lib/tools/frequencies.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"]) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); } }; }();\n\nvar DEFAULT_TEMPO = 120;\nvar DEFAULT_QUANTIZATION = 4;\nvar DEFAULT_SAMPLE_RATE = 44100;\n\nfunction pitchConsensus(detectors, chunk) {\n  var pitches = detectors.map(function (fn) {\n    return fn(chunk);\n  }).filter(Boolean).sort(function (a, b) {\n    return a < b ? -1 : 1;\n  });\n\n  // In the case of one pitch, return it.\n  if (pitches.length === 1) {\n    return pitches[0];\n\n    // In the case of two pitches, return the geometric mean if they\n    // are close to each other, and the lower pitch otherwise.\n  } else if (pitches.length === 2) {\n    var _pitches = _slicedToArray(pitches, 2),\n        first = _pitches[0],\n        second = _pitches[1];\n\n    return first * 2 > second ? Math.sqrt(first * second) : first;\n\n    // In the case of three or more pitches, filter away the extremes\n    // if they are very extreme, then take the geometric mean. \n  } else {\n    var _first = pitches[0];\n    var _second = pitches[1];\n    var secondToLast = pitches[pitches.length - 2];\n    var last = pitches[pitches.length - 1];\n\n    var filtered1 = _first * 2 > _second ? pitches : pitches.slice(1);\n    var filtered2 = secondToLast * 2 > last ? filtered1 : filtered1.slice(0, -1);\n    return Math.pow(filtered2.reduce(function (t, p) {\n      return t * p;\n    }, 1), 1 / filtered2.length);\n  }\n}\n\nmodule.exports = function (detector, float32AudioBuffer) {\n  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};\n\n\n  var tempo = options.tempo || DEFAULT_TEMPO;\n  var quantization = options.quantization || DEFAULT_QUANTIZATION;\n  var sampleRate = options.sampleRate || DEFAULT_SAMPLE_RATE;\n\n  var bufferLength = float32AudioBuffer.length;\n  var chunkSize = Math.round(sampleRate * 60 / (quantization * tempo));\n\n  var getPitch = void 0;\n  if (Array.isArray(detector)) {\n    getPitch = pitchConsensus.bind(null, detector);\n  } else {\n    getPitch = detector;\n  }\n\n  var pitches = [];\n  for (var i = 0, max = bufferLength - chunkSize; i <= max; i += chunkSize) {\n    var chunk = float32AudioBuffer.slice(i, i + chunkSize);\n    var pitch = getPitch(chunk);\n    pitches.push(pitch);\n  }\n\n  return pitches;\n};\n\n//# sourceURL=webpack:///./node_modules/pitchfinder/lib/tools/frequencies.js?");

/***/ })

/******/ });