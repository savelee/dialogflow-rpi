var gpio = require('rpi-gpio');
var button = 23;
var led = 25;
gpio.setup(button, gpio.DIR_IN, readInput);
gpio.setup(led, gpio.DIR_OUT, write);
 
function readInput(err) {
    if (err) throw err;
    gpio.read(button, function(err, value) {
        if (err) throw err;
        console.log('The value is ' + value);

        write();
    });
}

function write(err) {
    if (err) throw err;
    gpio.write(led, true, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}