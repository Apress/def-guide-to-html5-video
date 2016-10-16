var prev_frame = null;
var threshold = 25;

function toGrey(frame) {
  grayFrame = new Array (frame.data.length / 4);
  for (i = 0; i < grayFrame.length; i++) {
    r = frame.data[4*i+0];
    g = frame.data[4*i+1];
    b = frame.data[4*i+2];
    grayFrame[i] = Math.min(0.3*r + 0.59*g + 0.11*b, 255);
  }
  return grayFrame;
}

onmessage = function (event) {
  // receive the image data
  var data = event.data;
  var frame = data.frame;

  // convert current frame to gray
  cur_frame = toGrey(frame);
  
  // avoid calling this the first time
  if (prev_frame != null) {
    // calculate difference
    for (i = 0; i < cur_frame.length; i++) {
      if (Math.abs(prev_frame[i] - cur_frame[i]) > threshold) {
        // color in pixels with high difference
        frame.data[4*i+0] = 0;
        frame.data[4*i+1] = 100;
        frame.data[4*i+2] = 255;
      }
    }
  }

  // remember current frame as previous one
  prev_frame = cur_frame;

  // send the image data back to main thread
  postMessage(frame);
}