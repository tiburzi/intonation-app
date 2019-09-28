function Util () {};

Util.arrayAverage = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

Util.lerp = function(a, b, n) {
  return (1 - n) * a + n * b;
}

Util.lengthdirX = (angle, dist) => dist*Math.cos(angle);
Util.lengthdirY = (angle, dist) => dist*Math.sin(angle);

Util.finiteArrayPush = function(arr, value, max_values) {
  arr.push(value);
  if (arr.length>max_values) {arr.shift();}
}

// standard deviation code from https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
Util.standardDeviation = function(values) {
  var avg = Util.arrayAverage(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = Util.arrayAverage(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}