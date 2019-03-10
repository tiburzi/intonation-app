function TweenHelper() {}

TweenHelper.TWEEN = null;
TweenHelper.TWEEN_SCALE_NORMAL = 	1.0;
TweenHelper.TWEEN_SCALE_UP = 		1.2;
TweenHelper.TWEEN_SCALE_DOWN = 		0.8;

TweenHelper.init = function(_tween) {
	TWEEN = _tween;
}

TweenHelper.tween = function(obj, params, time) {
	// Define and start a generic tween
	var t = new TWEEN.Tween(obj)
	    .to(params, time)
	    .easing(TWEEN.Easing.Cubic.Out)
	    .start();
	return t;
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