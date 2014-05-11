1. The decoder does not seem to correctly decode the MakerNote and UserComment
fields in the exif object, so I just delete them so that we do not
have a bunch of un-decoded bytes wasting space in the JSON.

2. The GPSTimeStamp array is important, because this is the time
stamp of the moment the phone got the actual GPS coordinate that is
associated with the image. This is often not the same point in time
that the picture itself was taken. This is particularly true with
my phone which does not have a very reliable GPS unit.
