// initialisation for segmentation
var width = 320;
var height = 160;
var region = new Array (width*height);
var index = 0;
region[0] = {};
region[0]['weight'] = 0;
region[0]['x1'] = 0;
region[0]['x2'] = 0;
region[0]['y1'] = 0;
region[0]['y2'] = 0;

function isSkin(r,g,b) {
  base = r + g + b;
  rn = r / base;
  gn = g / base;
  bn = b / base;
  if (rn > 0.35 && rn < 0.5 && gn > 0.2 && gn < 0.5 && bn > 0.2 && bn < 0.35 && base > 250) {
    return true;
  } else {
    return false;
  }
}


onmessage = function (event) {
  // receive the image data
  var data = event.data;
  var frame  = data.frame;
  var height = data.height;
  var width  = data.width;

  // initialize region fields and color in motion pixels
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      i = x + width*y;
      if (i != 0) region[i] = {};
      region[i]['weight'] = 0;
      // calculate skin color?
      if (isSkin(frame.data[4*i],frame.data[4*i+1],frame.data[4*i+2])) {
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
  // grow regions around each face color pixel
  // add onto each motion pixel the neighbors weight in 5x5 distance
  // and remember the extent of the rectangular region that these cover
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

  // send the image data + rectangle back to main thread
  arg = {
    frame: frame,
    x: region[index]['x1'],
    y: region[index]['y1'],
    w: (region[index]['x2'] - region[index]['x1']),
    h: (region[index]['y2'] - region[index]['y1'])
  }
  postMessage(arg);
}