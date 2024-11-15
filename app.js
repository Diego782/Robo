const net = require('net');
const fs = require('fs');
const Mqtt = require('mqtt');
const Gt06 = require('./gt06');

const serverPort = process.env.GT06_SERVER_PORT || 4000;
const rootTopic = process.env.MQTT_ROOT_TOPIC || 'gt06';
const brokerUrl = process.env.MQTT_BROKER_URL || '11ec3ffa829840c785105a23a3994db1.s1.eu.hivemq.cloud';
const brokerPort = process.env.MQTT_BROKER_PORT || 1883;
const mqttProtocol = process.env.MQTT_BROKER_PROTO || 'mqtt';
const brokerUser = process.env.MQTT_BROKER_USER || 'DiegoGPS';
const brokerPasswd = process.env.MQTT_BROKER_PASSWD || 'Dl1042248136!';

var mqttClient = Mqtt.connect({
    host: brokerUrl,
    port: brokerPort,
    protocol: mqttProtocol,
    username: brokerUser,
    password: brokerPasswd
});

mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
});

var server = net.createServer((client) => {
    var gt06 = new Gt06();
    console.log('client connected');

    client.on('error', (err) => {
        console.error('client error', err);
    });

    client.on('close', () => {
        console.log('client disconnected');
    });

    client.on('data', (data) => {
        try {
            gt06.parse(data);
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

            // Publicar datos en el broker MQTT
            gt06.msgBuffer.forEach(msg => {
                mqttClient.publish(rootTopic + '/' + gt06.imei + '/pos', JSON.stringify(msg));
            });

            gt06.clearMsgBuffer();
        } catch (e) {
            console.log('err', e);
            return;
        }
    });
});

server.listen(serverPort, () => {
    console.log(`Server listening on port ${serverPort}`);
});