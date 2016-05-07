## **msp-mobile (hybrid) app**


**steps to build the repo:**
```
git clone https://github.com/moraspirit/msp-mobile.git
npm install 
bower install
ionic platform add android


ionic emulate android
or 
ionic build android
ionic run android
or 
ionic serve -run

```
use emulator or a real device always if possible.

**API server**
```
npm install
node server/server.js
```

**run the app live on device**

make sure your device and pc is connected to same network. also install **phonegap** app on device from google play store.
```
phonegap serve android
```
open the app, type url given by phonegap command and hit 'connect'.

![moraspirit logo](http://moraspirit.com/sites/default/files/msp_text_logo_300.png)  
baked with ♥♥ in UOM.
