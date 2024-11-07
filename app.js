const net = require('net');

// Crea el servidor TCP
const server = net.createServer((socket) => {
    console.log('Nueva conexión de GPS');

    socket.on('data', (data) => {
        console.log('Datos recibidos:', data);

        // Verifica si el mensaje es de tipo 01 (registro de terminal)
        if (data.length >= 2 && data[0] === 0x78 && data[1] === 0x78 && data[3] === 0x01) {
            console.log('Mensaje de registro recibido');
            
            // Prepara la respuesta de confirmación
            const response = Buffer.from([0x78, 0x78, 0x05, 0x01, 0x00, 0x01, 0xD9, 0xDC, 0x0D, 0x0A]);
            
            // Envía la confirmación al GPS
            socket.write(response);
            console.log('Respuesta de confirmación enviada');
        } else {
            console.log('Mensaje desconocido recibido');
        }
    });

    socket.on('close', () => {
        console.log('Conexión cerrada');
    });
});

// Inicia el servidor en el puerto 3000
server.listen(4000, () => {
    console.log('Servidor TCP escuchando en el puerto 3000');
});
