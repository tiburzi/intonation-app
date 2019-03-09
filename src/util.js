function Util () {};

Util.arrayAverage = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

Util.lerp = function(a, b, n) {
  return (1 - n) * a + n * b;
}

Util.lengthdirX = (angle, dist) => dist*Math.cos(angle);
Util.lengthdirY = (angle, dist) => dist*Math.sin(angle);