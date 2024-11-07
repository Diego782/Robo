const net = require('net');
const Gt06 = require('./gt06'); // Asegúrate de que el archivo Gt06.js esté en la misma carpeta o proporciona la ruta correcta

const PORT = 3000; // Puerto de escucha

// Crear un servidor TCP
const server = net.createServer((socket) => {
    console.log('Nuevo dispositivo conectado');

    const gps = new Gt06();

    // Manejar los datos que llegan desde el dispositivo GPS
    socket.on('data', (data) => {
        console.log('Datos recibidos:', data.toString('hex'));
        
        try {
            gps.parse(data); // Procesa los datos recibidos
            
            if (gps.expectsResponse) {
                socket.write(gps.responseMsg); // Envía la respuesta generada al GPS
                console.log('Respuesta enviada:', gps.responseMsg.toString('hex'));
            }
        } catch (error) {
            console.error('Error al procesar los datos:', error);
        }
    });

    // Manejar la desconexión del GPS
    socket.on('end', () => {
        console.log('Dispositivo desconectado');
    });

    // Manejar errores de la conexión
    socket.on('error', (err) => {
        console.error('Error de conexión:', err);
    });
});

// Iniciar el servidor y escuchar en el puerto especificado
server.listen(PORT, () => {
    console.log(`Servidor TCP escuchando en el puerto ${PORT}`);
});
