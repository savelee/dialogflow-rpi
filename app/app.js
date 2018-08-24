//https://bloggerbrothers.com/2017/01/15/the-complete-guide-to-enabling-speech-recognition-on-an-rpi3-in-nodejs/
require('dotenv').config();

const dialogflow = require('dialogflow');
const common = require('@google-cloud/common');
const structjson = require('./structjson');
const Speech = require('@google-cloud/speech');
const speech = new Speech.SpeechClient();
const record = require('node-record-lpcm16');
const uuidv1 = require('uuid/v1');

const Gpio = require('onoff').Gpio;
const led = new Gpio(25, 'out');
const button = new Gpio(23, 'in', 'both');

const projectId =  process.env.GCLOUD_PROJECT;

const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, uuidv1());
var player = require('play-sound')({players: "aplay"});
 

//stream();

var busy = false; 
button.watch((err, value) => {
    if (err) {
        console.log(err);
    }

    if(value == 0){
        stream();
    } else {
        record.stop();
        busy = false;
    }
});

process.on('SIGINT', () => { unexport(); });
process.on('exit', () => { unexport(); });
process.on('SIGUSR1', () => { unexport(); });
process.on('SIGUSR2', () => { unexport(); });
process.on('uncaughtException', () => { unexport(); });

function unexport(){
    led.unexport();
    button.unexport();
}

function stream() {
    if (busy == true) { 
        return; 
    }
    busy = true; 
    
    console.log("Kickedprocess.");
    
    var encoding = "LINEAR16";
    var sampleRateHertz = 16000;
    var languageCode = "en-US";

    const request = {
        config: {
          encoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: languageCode
        },
        interimResults: false // If you want interim results, set this to true
      };

    console.log(request);

    // Create a recognize stream
    const recognizeStream = speech
    .streamingRecognize(request)
    .on('error', function(err){
        console.log(err);
    })
    .on('data', function(data){
        if (led.readSync() === 1) led.writeSync(0);
        console.log(data);

        if(data.results[0] && data.results[0].alternatives[0]){
            var query = data.results[0].alternatives[0].transcript;

            console.log(query);

            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                    text: query,
                    languageCode: languageCode,
                    },
                }
            };

            promise = sessionClient.detectIntent(request);
            promise.then(responses => {
              console.log('Detected intent');

              var result = responses[0].queryResult;
              var text = result.fulfillmentText;
              var level = result.intentDetectionConfidence;
              var match = result.intent.displayName;

              console.log("   -" + text);
              console.log("   -" + level);
              console.log("   -" + match);
              
              if(match == "FAIL"){
                // configure arguments for executable if any
                if (led.readSync() === 0) led.writeSync(1);
                player.play('buzz.wav', {}, function(err){
                  //if (err) throw err;
                });
              }
              if(match == "CORRECT"){
                // configure arguments for executable if any
                if (led.readSync() === 0) led.writeSync(1);
                player.play('win.wav', {}, function(err){
                  //if (err) throw err;
                });
              }

            })
            .catch(err => {
              console.error('ERROR:', err);
            });

        }
    }

    );

    record
    .start({
        sampleRateHertz: 16000,
        threshold: 0,
        verbose: false,
        recordProgram: 'arecord', // Try also "arecord" or "sox"
        silence: '10.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream);

    console.log('Listening, press Ctrl+C to stop.');
  }



