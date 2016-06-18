# ![moraspirit logo](http://moraspirit.com/sites/default/files/moraspirit_logo.png)   **msp-mobile (hybrid) app**

####**_Steps to build and run the project_**

**Build the repo:**

>`git clone https://github.com/moraspirit/msp-mobile.git`

>`npm install` 

>`bower install`

>`ionic platform add android`


**Setup and start the API server:**

>`npm install`

>`node server/server.js`


**Steps to run the live app on local browser:**

>set API_HOST in app.js at line 9 to 'http://localhost'
>`ionic serve`


**Steps to run the live app on a real device (Using IONIC RUN):**
>download **ngrok** from [ngrok official website](https://ngrok.com/) - _”I want to expose a local server behind a NAT or firewall to the internet.”_

>run **ngrok.exe** or `$ ngrok` if Linux

>in the ngrok shell, run `ngrok http 3000`   _(here, 3000 is the same port that the API server is listening)_

>ngrok will give you a hash, containing URL which is the public URL of your tunnel.

>copy the hash and set the API_HOST in app.js at line 

>keep the **ngrok** running

>`ionic run android`


**Steps to run the live app on a real device (Using PHONEGAP app):**
>complete all the steps of **_Steps to run the app on a real device (Using IONIC RUN)_** except the last one

>install **phonegap** app on the device from google play 

>make sure your device and pc is connected to same network

>`phonegap serve android --port 2000`

>open the phonegap app, type url given by phonegap command and hit 'connect'.

![moraspirit logo](http://moraspirit.com/sites/default/files/msp_text_logo_300.png)  
baked with ♥♥ in UOM.
