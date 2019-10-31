const onvif = require('./lib/node-onvif');

// Create an OnvifDevice object
let devurl = 'http://192.168.4.40:10080/onvif/device_service';
const fs = require('fs');

// Create an OnvifDevice object
let device = new onvif.OnvifDevice({
    xaddr: devurl,
    user: 'admin',
    pass: '123456789'
});

console.log('device-->', device);
device.init().then((info) => {
    // Show the detailed information of the device.
    console.log(JSON.stringify(info, null, '  '));
}).catch((error) => {
    console.error(error);
});