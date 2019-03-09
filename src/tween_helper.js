function TweenHelper() {
	var TWEEN = null;
}

TweenHelper.init = function(_tween) {
	TWEEN = _tween;
}

TweenHelper.tweenToScale = function(obj, s, time) {
	// Define and start a tween to scale the object
	var tweenScale = new TWEEN.Tween(obj)
	    .to({ scale:s }, time)
	    .easing(TWEEN.Easing.Cubic.Out)
	    .start();
	return tweenScale;
}

TweenHelper.tweenToOpacity = function(obj, op, time) {
    // Define and start a tween to change the object's opacity
    var tweenOpacity = new TWEEN.Tween(obj)
        .to({ opacity:op }, time)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    return tweenOpacity;
}