/**
 * Created by Nicholas Hallahan <nick@theoutpost.io>
 *       on 5/11/14.
 */

var ExifImage = require('exif').ExifImage;
var fs        = require('fs');

var geojson = {
  type: "FeatureCollection",
  features: []
};

function exifToFeature(exifData) {
  var gps = exifData.gps;
  var lat = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / 3600;
  var lng = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / 3600;
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
  var gpsDate = new Date( parseInt(gpsDateArr[0]),
                          parseInt(gpsDateArr[1]) - 1 , // Jan is 0
                          parseInt(gpsDateArr[2]),
                          gps.GPSTimeStamp[0],
                          gps.GPSTimeStamp[1],
                          gps.GPSTimeStamp[2] );
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


try {
  new ExifImage({ image : '2014-05-10 15.42.36.jpg' }, function (error, exifData) {
    if (error)
      console.log('Error: '+error.message);
    else {
      // NH - Get rid of properties that the exif decoder does not
      // correctly decode. Wastes a bunch of space...
      delete exifData.exif.MakerNote;
      delete exifData.exif.UserComment;
      delete exifData.makernote;

      geojson.features.push(exifToFeature(exifData));

      fs.writeFileSync('test2.json', JSON.stringify(geojson, null, 2));
    }
  });
} catch (error) {
  console.log('Error: ' + error.message);
}

try {
  new ExifImage({ image : 'deer.jpg' }, function (error, exifData) {
    if (error)
      console.log('Error: '+error.message);
    else {
      // NH - Get rid of properties that the exif decoder does not
      // correctly decode. Wastes a bunch of space...
      delete exifData.exif.MakerNote;
      delete exifData.exif.UserComment;
      delete exifData.makernote;

      geojson.features.push(exifToFeature(exifData));

      fs.writeFileSync('test2-deer.json', JSON.stringify(geojson, null, 2));
    }
  });
} catch (error) {
  console.log('Error: ' + error.message);
}
