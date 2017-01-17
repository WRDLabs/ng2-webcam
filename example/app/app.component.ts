import { Component } from '@angular/core';
import { FallbackDispatcher } from '../../index';

@Component({
  selector: 'app-component',
  templateUrl: 'app.component.html'
})

class AppComponent {

  error: any;
  options: any;
  onSuccess: Function;
  onError: Function;
  flashPlayer: FallbackDispatcher;

  constructor() {
    this.options = {
      audio: false,
      video: true,
      width: 320,
      height: 240,
      fallbackQuality: 200,
      fallbackSrc: 'lib/fallback/jscam_canvas_only.swf'
    };
    this.onSuccess = (stream: any) => {
      if (stream instanceof FallbackDispatcher) {
        this.flashPlayer = <FallbackDispatcher>stream;
        this.onFallback();
      }
      console.log('capturing video stream');
    };
    this.onError = (err) => {
      console.log(err);
    };
  }

  /**
   * Implement fallback external interface
   */
  onFallback(): void {
    const self = this;
    const canvas = <any>document.getElementsByTagName('canvas')[0];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const size = self.flashPlayer.getCameraSize();
      const w = size.width;
      const h = size.height;
      const externData = {
        imgData: ctx.getImageData(0, 0, w, h),
        pos: 0
      };

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      FallbackDispatcher.implementExternal({
        onSave: (data) => {
          try {
            let col = data.split(';');
            let tmp = null;

            for (let i = 0; i < w; i++) {
              tmp = parseInt(col[i], 10);
              externData.imgData.data[externData.pos + 0] = (tmp >> 16) & 0xff;
              externData.imgData.data[externData.pos + 1] = (tmp >> 8) & 0xff;
              externData.imgData.data[externData.pos + 2] = tmp & 0xff;
              externData.imgData.data[externData.pos + 3] = 0xff;
              externData.pos += 4;
            }

            if (externData.pos >= 4 * w * h) {
              ctx.putImageData(externData.imgData, 0, 0);
              externData.pos = 0;
            }
          } catch (e) {
            console.error(e);
          }

        },
        debug: (tag, message) => {
          console.log(tag, message);
        },
        onCapture: () => {
          self.flashPlayer.save();
        },
        onTick: (time) => {
          // do nothing
        }
      });
    }
  }
  
  capture(): void {
    const video = <any>document.getElementsByTagName('video')[0];
    const canvas = <any>document.getElementsByTagName('canvas')[0];
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
    } else {
      this.flashPlayer.capture();
    }
  }
}

export default AppComponent;
