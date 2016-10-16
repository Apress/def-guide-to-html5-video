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
      // replace with sepia colors
      frame.data[4*i+0] = Math.min(0.393*r + 0.769*g + 0.189*b, 255);
      frame.data[4*i+1] = Math.min(0.349*r + 0.686*g + 0.168*b, 255);
      frame.data[4*i+2] = Math.min(0.272*r + 0.534*g + 0.131*b, 255);
    }
  }

  // send the image data back to main thread
  postMessage(frame);

}