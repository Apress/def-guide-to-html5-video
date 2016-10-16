onmessage = function (event) {
  // receive the image data
  var data = event.data;
  var frame = data.frame;
  var h = data.height;
  var w = data.width;
  var x,y;

  // Loop over each pixel of frame
  for (x = 0; x < w; x++) {
    for (y = 0; y < h; y++) {
      // index in image data array
      i = x + w*y;
      // grab colors
      r = frame.data[4*i+0];
      g = frame.data[4*i+1];
      b = frame.data[4*i+2];
      col = Math.min(0.3*r + 0.59*g + 0.11*b, 255);
      // replace with black/white
      frame.data[4*i+0] = col;
      frame.data[4*i+1] = col;
      frame.data[4*i+2] = col;
    }
  }

  // send the image data back to main thread
  postMessage(frame);
}