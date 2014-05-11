var ExifImage = require('exif').ExifImage;
var fs        = require('fs');

try {
  new ExifImage({ image : 'img/2014-05-10 11.10.04.jpg' }, function (error, exifData) {
    if (error)
      console.log('Error: '+error.message);
    else {
      fs.writeFileSync('test.json', JSON.stringify(exifData, null, 2));
    }
  });
} catch (error) {
  console.log('Error: ' + error.message);
}
