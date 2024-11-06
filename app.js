const buffer = Buffer.from('78781f12180b02173603c4012bea4c08071160001c00000000000000000006c1940d0a', 'hex');

function parseLocation(data) {
    let datasheet = {
        startBit: data.readUInt16BE(0),
        protocolLength: data.readUInt8(2),
        protocolNumber: data.readUInt8(3),
        fixTime: data.slice(4, 10),
        quantity: data.readUInt8(10),
        lat: data.readUInt32BE(11),
        lon: data.readUInt32BE(15),
        speed: data.readUInt8(19),
        course: data.readUInt16BE(20),
        mcc: data.readUInt16BE(22),
        mnc: data.readUInt8(24),
        lac: data.readUInt16BE(25),
        cellId: parseInt(data.slice(27, 30).toString('hex'), 16),
        serialNr: data.readUInt16BE(30),
        errorCheck: data.readUInt16BE(32)
    };
    return datasheet;
}

function decodeGt06Lat(lat, course) {
    var latitude = lat / 30000.0 / 60.0;
    if (!(course & 0x0400)) {
        latitude = -latitude;
    }
    return Math.round(latitude * 1000000) / 1000000;
}

function decodeGt06Lon(lon, course) {
    var longitude = lon / 30000.0 / 60.0;
    if (!(course & 0x0800)) {
        longitude = -longitude;
    }
    return Math.round(longitude * 1000000) / 1000000;
}

const parsedData = parseLocation(buffer);
console.log(parsedData);

const decodedLat = decodeGt06Lat(parsedData.lat, parsedData.course);
const decodedLon = decodeGt06Lon(parsedData.lon, parsedData.course);

console.log('Latitud decodificada:', decodedLat);
console.log('Longitud decodificada:', decodedLon);