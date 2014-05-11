/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 5/11/14.
 */

var ExifImage = require('exif').ExifImage;
var fs        = require('fs');
var flow      = require('flow');

var geojson = {
  type: "FeatureCollection",
  features: []
};

function exifToFeature(exifData) {
  var gps = exifData.gps;
  if (!gps.GPSLatitude) {
    throw "No GPS data";
  }
  var lat = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / 3600;
  var lng = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / 3600;
  if (gps.GPSLatitudeRef.toLowerCase() === 's') {
    lat = - lat;
  }
  if (gps.GPSLongitudeRef.toLowerCase() === 'w') {
    lng = - lng;
  }
  var alt = gps.GPSAltitude;
  var coord = alt ? [lng, lat, alt] : [lng, lat];
  var feat = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": coord
    }
  };
  feat.properties.exif = exifData;

  // time the gps coordinate was taken
  var gpsDateArr = gps.GPSDateStamp.split(':');
  var gpsDate = new Date(Date.UTC( parseInt(gpsDateArr[0]),
                                   parseInt(gpsDateArr[1]) - 1 , // Jan is 0
                                   parseInt(gpsDateArr[2]),
                                   gps.GPSTimeStamp[0],
                                   gps.GPSTimeStamp[1],
                                   gps.GPSTimeStamp[2] ) );
  feat.properties.gpsTime = gpsDate.getTime();
  feat.properties.gpsTimeStr = gpsDate.toString();

  // time the actual picture was taken.
  // NH FIXME: We are assuming the pic was taken in the current timezone?
  var imgStr = exifData.exif.CreateDate;
  imgStr = imgStr.replace(':','-').replace(':','-');
  var imgDate = new Date(imgStr);
  feat.properties.imgTime = imgDate.getTime();
  feat.properties.imgTimeStr = imgDate.toString();

  return feat;
}

function processImage(imgPath, cb) {
  try {
    new ExifImage({ image : imgPath }, function (error, exifData) {
      if (error)
        console.error('Error for ' + imgPath + ': ' + error.message);
      else {
        // NH - Get rid of properties that the exif decoder does not
        // correctly decode. Wastes a bunch of space...
        delete exifData.exif.MakerNote;
        delete exifData.exif.UserComment;
        delete exifData.makernote;

        try {
          var feat = exifToFeature(exifData);
          feat.properties.imgPath = imgPath;
          geojson.features.push(feat);
        } catch (err) {
          console.log(err + ' in ' + imgPath + '. Skipping...');
        }
        cb();
      }
    });
  } catch (error) {
    console.error(JSON.stringify(error,null,2));
    cb();
  }
}

console.log('Reading images in img directory...');
var imgPaths = fs.readdirSync('img');
flow.exec(function(){
  for (var i = 0, len = imgPaths.length; i < len; ++i) {
    var imgPath = 'img/' + imgPaths[i];
    processImage(imgPath, this.MULTI());
  }
}, function() {
  var outputPath = 'exif.geojson';
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log('Wrote GeoJSON to: ' + outputPath);
  console.log('Able to process ' + geojson.features.length + ' out of ' + imgPaths.length + ' images.');
});
