I've created the YES-BUT... machine on a Raspberry Pi. Press a button to start, lights will turn on. - When the RPI microphone hears someone saying "..yes..but" (i.s.o a positive: "...yes..and.."); a sound will be played.

# Software Setup 

This Readme contains the software setup (SSD setup) that we followed to get the Google AIY Voice Kit v1 to work, and to use it without keyboard and mouse. 

## 1. SSD Disk Image setup

For this step, you'll need a micro SSD card and a cardreader. Make sure the SSD has 16GB or more. It will be formatted so make sure there's nothing valuable on there. 

The kit we're working with is v1, and there is a new kit out, v2. That means some of the links in the booklet are now changed to the v2 version. 

The disk image you need is not in the location specified. 
Find the documentation here instead: [https://aiyprojects.withgoogle.com/voice-v1/](https://aiyprojects.withgoogle.com/voice-v1/). The disk image is [here](https://dl.google.com/dl/aiyprojects/aiyprojects-latest.img.xz).

Download the disk image. 

Use [Etcher](https://etcher.io/) to burn the disk image to an Micro SD. 

Don't insert the card in the Raspberry just yet :) we need to do some minor adjustments. 

## 2. Configure Micro SD

We're going to use the Raspberry without keyboard, mouse, and monitor. That is not how the Google booklet sets it up, so we'll need to modify the setup.

Put the Micro SD card in the RPI. When it's your first time starting the GUI, it will ask you to setup the language for Raspbian.

It will prompt you, to change the password. Change the password to
something you will remember.

1. Click on the WIFI symbol in the top left, and choose a network
2. Click the Check WIFI script, to test the WIFI network
3. When the WIFI is working, click the Check Audio script, to verify the audiocard is working. - If not, make sure the speaker is well connected.
4. Write down the RPI IP address. You can find your ip address by opening a terminal and enter: `ifconfig`. The IP address written next to the WLAN0 entry, is the one to remember.

### SSH

On your macbook run:

`ssh ip@ip-address-of-RPI`

### Boot up the Raspberry Pi

Eject the SD, and insert it in the Raspberry Pi. Turn on the power, and it should boot up. Allow up to 90 seconds to boot up.

*Important* Once the Raspberry is powered on, don't just remove power. It needs to be properly shutdown. Use terminal command `shutdown -f now`. Otherwise you risk damaging the SSD install and you'll be at square one. 

# Install Node JS

We will make use of the Node version of Dialogflow,
therefore install Node JS on the RPI.
You can do this via SSH.

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

# Get the Google credentials

To use the Google Cloud services you need to have 
credentials for authentication.  This is how Google 
knows who to charge for large volumes of service calls.  
Don’t worry though – your app wont do more than the free-tier.

First – you’ll need to make sure you have a google account.  Gmail is perfect.  If you don’t yet have that – create one!  They are free, and the sign-up process is quick.

Once you’ve logged into your account – head over to 
Google Cloud Console:

https://console.cloud.google.com

1. Create a project
2. Click: APIs & Services:
3. Enable the following APIs:

* Dialogflow

4. Next, Click on **Credentials** in the APIs & Services menu.
5. Click: **Create Crendtials** -> **Service Account Key**
6. Select **Dialogflow Integrations** and **JSON**, click **Create**.
7. Copy the contents of the service key to your clipboard, this will be pasted in your RPI later.


# Load the files

1. While SSH-ed into the RPI, clone the following project and go into the folder:

`git clone https://github.com/savelee/dialogflow-rpi.git`

2. Execute the following commands, to prepare your code:

```
cd dialogflow-rpi\app
npm install
```

3. Create the following *environment variables. Make sure *GCLOUD_PROJECT* points to your Google Cloud Project ID:

`nano .env`

```
GCLOUD_PROJECT='PROJECT-ID'
GCLOUD_KEY_FILE=./cloudkey.json
```

4. Create the credentials file:

`nano cloudkey.json`

5. Copy the contents from the downloaded credentials key, into cloudkey.json and save.

6. Run: `export GOOGLE_APPLICATION_CREDENTIALS=~/cloudkey.json`


# Dialogflow

1. Open http://console.dialogflow.com
2. Create a new Dialogflow project
3. Cick the gear icon to navigate to the settings screen.
4. Link your Dialogflow project to your GCP project id.

Once, the Dialogflow instance is configured, we can import
the intents from the `dialogflow-rpi/dialogflow` folder.


# Test

Start your app: `npm start` and press the RPI button. - Then talk.

# Run a process manager

When an error occurs, you don't want the script to abort. What you will need is a Node module, which can run your script: *pm2*.

`sudo npm install pm2 -g`

And then start your script like:

`pm2 start app.js`

(with `pm2 stop all` you can stop the script again)

# Run while booted

The next thing to happen is, this script will need to start when the RPI powered on.
We can do this through a bash script.

1. Open bash script

  `sudo nano /home/pi/.bashrc`

2. Add the following lines to the end of the script:

   ```
   echo Run node app.js at boot
   cd /home/pi/dialogflow-rpi/app
   sudo pm2 start app.js
   ```

*Note, if you turn the RPI on, on a different location, the WIFI will need to be configured again.*

# Boot when powered on

1. `sudo raspi-config`

2. Choose "Boot Options"

3. Select the first option in the list called “Desktop / CLI”

4. In the boot option, select the second option, which will force the Pi to boot in command line mode and automatically log in using the default user “pi”.

5. Finish and Reboot

# You're all set!

Power off & on or type in the ssh shell: `sudo reboot`.

Give it some time, to boot. (This could easily take 30sec)

Then hit the button, and try it out. Say:

**"Yes, I like the idea but I don't think it will work."**

Or:

**"That's a great idea, and to improve it we do xyz."**