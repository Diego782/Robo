
const Gt06 = require('./gt06');
const Mqtt = require('mqtt');
const net = require('net');
const fs = require('fs');

const serverPort = process.env.GT06_SERVER_PORT || 4000;
const rootTopic = process.env.MQTT_ROOT_TOPIC || 'gt06';
const brokerUrl = process.env.MQTT_BROKER_URL || '7eb3252c060046b5981c2b54688b5a91.s1.eu.hivemq.cloud';
const brokerPort = process.env.MQTT_BROKER_PORT || 1883;
const mqttProtocol = process.env.MQTT_BROKER_PROTO || 'mqtt';
const brokerUser = process.env.MQTT_BROKER_USER || 'DiegoGPS2';
const brokerPasswd = process.env.MQTT_BROKER_PASSWD || 'Dl1042248136.';

var mqttClient = Mqtt.connect(
    {
        host: brokerUrl,
        port: brokerPort,
        protocol: mqttProtocol,
        username: brokerUser,
        password: brokerPasswd
    }
);

mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
});

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
        }
        catch (e) {
            console.log('err', e);
            return;
        }
        if (gt06.event.string === 'location') {
         
        console.log('Latitude:', gt06.lat);
        console.log('Longitude:', gt06.lon);
        console.log('Hora:', gt06.fixTime);
        console.log('Rumbo:', gt06.course);
        console.log('velocidad:', gt06.speed);
        console.log('evento:', gt06.evenStr);

        }
        console.log(gt06);
   
        if (gt06.expectsResponse) {
            client.write(gt06.responseMsg);
        }
        gt06.msgBuffer.forEach(msg => {
            mqttClient.publish(rootTopic + '/' + gt06.imei +
                '/pos', JSON.stringify(msg));
        });
        gt06.clearMsgBuffer();
    });
});

server.listen(serverPort, () => {
    console.log('started server on port:', serverPort);
});