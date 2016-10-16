// initialisation for segmentation
var prev_frame = null;
var cur_frame = null;
var threshold = 25;
var width = 320;
var height = 160;
region = new Array (width*height);
index = 0;
region[0] = {};
region[0]['weight'] = 0;
region[0]['x1'] = 0;
region[0]['x2'] = 0;
region[0]['y1'] = 0;
region[0]['y2'] = 0;


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
  var frame  = data.frame;
  var height = data.height;
  var width  = data.width;

  // convert current frame to gray
  cur_frame = toGrey(frame);

  // avoid calculating on the first frame
  if (prev_frame != null) {

    // calculate difference between pixels
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        i = x + width*y;
        // initialize region fields
        if (i != 0) region[i] = {};
        region[i]['weight'] = 0;
        if (Math.abs(prev_frame[i] - cur_frame[i]) > threshold) {
          // color in pixels with high difference
          frame.data[4*i+0] = 0;
          frame.data[4*i+1] = 100;
          frame.data[4*i+2] = 255;
          // initialize the regions
          region[i]['weight'] = 1;
          region[i]['x1'] = x;
          region[i]['x2'] = x;
          region[i]['y1'] = y;
          region[i]['y2'] = y;
        }
      }
    }

    // segmentation
    // create regions around each motion pixels
    // add onto each motion pixel the neighbors weight in 5x5 distance
    // and remember the extent of the region that these cover
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        i = x + width*y;
        if (region[i]['weight'] > 0) {
          // check the neighbors
          for (xn = Math.max(x-2,0); xn <= Math.min(x+2,width-1); xn++) {
            for (yn = Math.max((y-2),0); yn <= Math.min((y+2),(height-1)); yn++) {
              j = xn + width*yn;
              if (j != i) {
                if (region[j]['weight'] > 0) {
                  region[i]['weight'] += region[j]['weight'];
                  region[i]['x1'] = Math.min(region[i]['x1'], region[j]['x1']);
                  region[i]['y1'] = Math.min(region[i]['y1'], region[j]['y1']);
                  region[i]['x2'] = Math.max(region[i]['x2'], region[j]['x2']);
                  region[i]['y2'] = Math.max(region[i]['y2'], region[j]['y2']);
                }
              }
            }
          }
        }
      }
    }

    // find one of the heaviest pixels, which should be one of the largest clusters
    max = 0;
    index = 0; // reset
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        i = x + width*y;
        if (region[i]['weight'] > max) {
          max = region[i]['weight'];
          index = i;
        }
      }
    }

  } // ends if

  // remember current frame as previous one
  prev_frame = cur_frame;

  // send the image data + rectangle back to main thread
  arg = {
    frame : frame,
    x: region[index]['x1'],
    y: region[index]['y1'],
    w: (region[index]['x2'] - region[index]['x1']),
    h: (region[index]['y2'] - region[index]['y1'])
  }
  postMessage(arg);
}
