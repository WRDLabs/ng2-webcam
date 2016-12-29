# ng2-webcam

> ng2-webcam is a cross-browser angular2 component, it will use the browser's native `getUserMedia()` implementation, otherwise a Flash fallback will be loaded instead.

## Screenshot

![Screenshot](https://bytebucket.org/archik/ng2-webcam/raw/c728ec3fd1e0008dc67873c20897427e9f5b0c0a/media/screen.png)

## Notes

This component based on [getUserMedia.js Polyfill](https://github.com/addyosmani/getUserMedia.js).
Pls, check original repository for clear understanding


## Getting Started

```
npm install ng2-webcam --save
```

Use webcam as a pure angular2 component

1. Add component into your module
```javascript
import { WebCamComponent } from 'ng2-webcam';
...

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AppRouting
  ],
  declarations: [
    AppComponent,
    WebCamComponent
  ],
  bootstrap: [ AppComponent ]
})
class AppModule {
}
export default AppModule;
```
2. Use in html markup
```html
<ng2-webcam [options]="options" [onSuccess]="onSuccess" [onError]="onError"></ng2-webcam>
```

Below is a sample of options structure

```javascript
cont options = {
  audio: false,
  video: true,
  width: 500,
  height: 500
};
const onSuccess = () => {};
const onError = (err) => {};
```

You can capture image form webcam using following example
```javascript
...
const video = <any>document.getElementsByTagName('video')[0];
const canvas = <any>document.getElementsByTagName('canvas')[0];
if (video) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
}
...
```

## Fallback (flash)
Also You can extend options using flash fallback params

```javascript
cont options = {
  audio: false,
  video: true,
  width: 500,
  height: 500,
  fallbackMode: 'callback',
  fallbackSrc: '/node_modules/ng2-webcam/lib/fallback/jscam_canvas_only.swf',
  fallbackQuality: 85
};
const onSuccess = (flashplayer) => {
  self.flashplayer = flashplayer;
};
const onError = (err) => {};
```

Fallback implemented using ActionScript and for communication with this script You have to implement following external interface
```javascript
window.webcam = {
  // .as script logging
  debug: function (a, b) {
     console.log(a, b);
  },
  // Capture event callback
  onCapture: function () {
    self.flashplayer.save();
  },
  // Before setInterval callback
  onTick: function () {},
  // Save event callback
  onSave: function (data) {
    try {
      const win = <any>window;
      let col = data.split(';'),
        tmp = null,
        w = self.options.width,
        h = self.options.height;
      for (let i = 0; i < w; i++) {
        tmp = parseInt(col[i], 10);
        win.app.imgData.data[win.app.pos + 0] = (tmp >> 16) & 0xff;
        win.app.imgData.data[win.app.pos + 1] = (tmp >> 8) & 0xff;
        win.app.imgData.data[win.app.pos + 2] = tmp & 0xff;
        win.app.imgData.data[win.app.pos + 3] = 0xff;
        win.app.pos += 4;
      }

      if (win.app.pos >= 4 * w * h) {
        win.app.ctx.putImageData(win.app.imgData, 0, 0);
        win.app.pos = 0;
      }
    } catch (e) {
      console.error(e);
    }
  }
};

self.flashplayer.capture();
```
Check this file `lib/fallback/src/jscam.as` for clear understanding

![angular2](https://bytebucket.org/archik/ng2-webcam/raw/fa43c0a740dc806ed53022b9fc440aba169ab6e1/media/tech.png)

## [Credits](https://github.com/addyosmani/getUserMedia.js#credits)

## Spec references

* [getUserMedia()](https://w3c.github.io/mediacapture-main/getusermedia.html)
* [WebRTC 1.0](http://w3c.github.io/webrtc-pc/)

## License
Copyright (c) 2016 archik
Licensed under the MIT license.
