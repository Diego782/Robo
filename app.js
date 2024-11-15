const Gt06 = require('./gt06');
const net = require('net');
const fs = require('fs');

const serverPort = process.env.GT06_SERVER_PORT || 4000;

var server = net.createServer((client) => {
    var gt06 = new Gt06();
    console.log('client connected');

    server.on('error', (err) => {
        console.error('server error', err);
    });

    client.on('error', (err) => {
        console.error('client error', err);
    });

    client.on('close', () => {
        console.log('client disconnected');
    });

    client.on('data', (data) => {
        try {
            gt06.parse(data);
        } catch (e) {
            console.log('err', e);
            return;
        }
        console.log(gt06);

        // Enviar respuesta al GPS si se espera una respuesta
        if (gt06.expectsResponse) {
            client.write(gt06.responseMsg, (err) => {
                if (err) {
                    console.error('Error sending response to GPS:', err);
                } else {
                    console.log('Response sent to GPS');
                }
            });
        }

        // Aquí puedes agregar cualquier otra lógica que necesites para procesar los datos del GPS
        // Por ejemplo, almacenar los datos en una base de datos o realizar algún análisis

        gt06.clearMsgBuffer();
    });
});

server.listen(serverPort, () => {
    console.log('started server on port:', serverPort);
});