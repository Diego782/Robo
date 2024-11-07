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
        try {
            const location = parseLocation(data);
            console.log('Datos parseados:', location);

            // Verificar el tipo de mensaje y enviar la respuesta adecuada
            if (data.length >= 2 && data[0] === 0x78 && data[1] === 0x78 && data[3] === 0x01) { // Mensaje de tipo 0x01 (login)
                const response = Buffer.from([0x78, 0x78, 0x05, 0x01, 0x00, 0x01, 0xD9, 0xDC, 0x0D, 0x0A]);
                // Envía la confirmación al GPS
                socket.write(response);
                console.log('Respuesta enviada al GPS:', response.toString('hex'));
            }
        } catch (err) {
            console.error('Error al parsear los datos:', err.message);
        }
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