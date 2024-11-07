const net = require('net');

// Función para parsear la ubicación
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

    // Decodificar latitud y longitud
    datasheet.decodedLat = decodeGt06Lat(datasheet.lat, datasheet.course);
    datasheet.decodedLon = decodeGt06Lon(datasheet.lon, datasheet.course);

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

// Crear un servidor TCP
const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data) => {
        console.log('Datos recibidos:', data.toString('hex'));
        const location = parseLocation(data);
        console.log('Datos parseados:', location);
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });

    socket.on('error', (err) => {
        console.error('Error:', err);
    });
});

// El servidor escucha en el puerto 4000
server.listen(4000, () => {
    console.log('Servidor escuchando en el puerto 4000');
});