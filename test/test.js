var ExifImage = require('exif').ExifImage;
var fs        = require('fs');

try {
  new ExifImage({ image : '../img/deer.jpg' }, function (error, exifData) {
    if (error)
      console.log('Error: '+error.message);
    else {
      // NH - Get rid of properties that the exif decoder does not
      // correctly decode. Wastes a bunch of space...
      delete exifData.exif.MakerNote;
      delete exifData.exif.UserComment;
      delete exifData.makernote;

      fs.writeFileSync('test.json', JSON.stringify(exifData, null, 2));
    }
  });
} catch (error) {
  console.log('Error: ' + error.message);
}
