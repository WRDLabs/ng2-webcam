import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Component options structure interface
 */
interface Options {
  video: boolean;
  audio: boolean;
  width: number;
  height: number;
  fallbackSrc: string;
  fallbackMode: string;
  fallbackQuality: number;
}

/**
 * Render WebCam Component
 */
@Component({
  selector: 'ng2-webcam',
  templateUrl: 'webcam.component.html'
})
export class WebCamComponent implements OnInit, AfterViewInit {
  public videoSrc: any;
  public isSupportWebRTC: boolean;
  public isFallback: boolean;
  public browser: any;
  @Input() options: Options;
  @Input() onSuccess: Function;
  @Input() onError: Function;

  constructor(private sanitizer: DomSanitizer, private element: ElementRef) {
    this.isFallback = false;
    this.isSupportWebRTC = false;
    this.browser = <any>navigator;
  }

  ngOnInit() {
    // getUserMedia() feature detection
    this.browser.getUserMedia_ = (this.browser.getUserMedia
    || this.browser.webkitGetUserMedia
    || this.browser.mozGetUserMedia
    || this.browser.msGetUserMedia);
    this.isSupportWebRTC = !!this.browser.getUserMedia_;
    this.options.fallbackSrc = this.options.fallbackSrc || 'node_modules/ng2-webcam/lib/fallback/jscam_canvas_only.swf';
    this.options.fallbackMode = this.options.fallbackMode || 'callback';
    this.options.fallbackQuality = this.options.fallbackQuality || 85;
    this.options.width = this.options.width || 500;
    this.options.height = this.options.height || 500;
    // flash fallback detection
    this.isFallback = !this.isSupportWebRTC && !!this.options.fallbackSrc;
  }

  ngAfterViewInit() {
    this.startCapturingVideo();
  }

  /**
   * On webcam using native browser api
   * @returns {any}
   */
  onWebRTC(): any {
    if (this.options) {
      // constructing a getUserMedia config-object and
      // an string (we will try both)
      let optionObject = {audio: false, video: false};
      let optionString = '';
      let container, video, ow, oh;

      if (this.options.video === true) {
        optionObject.video = true;
        optionString = 'video';
      }
      if (this.options.audio === true) {
        optionObject.audio = true;
        if (optionString !== '') {
          optionString = optionString + ', ';
        }
        optionString = optionString + 'audio';
      }

      container = this.element.nativeElement.querySelector('#webcam');
      video = this.element.nativeElement.querySelector('video');
      video.autoplay = true;
      // Fix for ratio
      ow = parseInt(container.offsetWidth, 10);
      oh = parseInt(container.offsetHeight, 10);

      if (this.options.width < ow && this.options.height < oh) {
        this.options.width = ow;
        this.options.height = oh;
      }

      // configure the interim video
      video.width = this.options.width;
      video.height = this.options.height;
      video.autoplay = true;
      container.appendChild(video);

      const promisifyGetUserMedia = () => {
        return new Promise<string>((resolve, reject) => {
          // first we try if getUserMedia supports the config object
          try {
            // try object
            this.browser.getUserMedia_(optionObject, (stream) => resolve(stream), (err) => reject(err));
          } catch (e) {
            // option object fails
            try {
              // try string syntax
              // if the config object failes, we try a config string
              this.browser.getUserMedia_(optionString, (stream) => resolve(stream), (err) => reject(err));
            } catch (e2) {
              return reject(new Error('Both configs failed. Neither object nor string works'));
            }
          }
        });
      };

      // Promisify async callback's for angular2 change detection
      promisifyGetUserMedia().then((stream) => {
        let webcamUrl = URL.createObjectURL(stream);
        this.videoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(webcamUrl);
        this.onSuccess(stream);
      }).catch((err) => {
        this.onError(err);
      });
    }
    else {
      console.error('WebCam options is require');
    }
  }

  /**
   * On flash fallback
   * .swf file is necessary
   * @returns {any}
   */
  onFallback(): any {
    // Act as a plain getUserMedia shield if no fallback is required
    if (this.options) {
      // Fallback to flash
      const self = this;
      const cam = self.element.nativeElement.querySelector('#XwebcamXobjectX');
      cam.width = self.options.width;
      cam.height = self.options.height;

      const paramFlashVars = document.createElement('param');
      paramFlashVars.name = 'FlashVars';
      paramFlashVars.value = 'mode=' + this.options.fallbackMode + '&amp;quality=' + this.options.fallbackQuality;
      cam.appendChild(paramFlashVars);

      const paramAllowScriptAccess = document.createElement('param');
      paramAllowScriptAccess.name = 'allowScriptAccess';
      paramAllowScriptAccess.value = 'always';
      cam.appendChild(paramAllowScriptAccess);

      // if (this.browser.appVersion.indexOf('MSIE') > -1) {
      // if (isIE) {
        cam.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
        const paramMovie = document.createElement('param');
        paramMovie.name = 'movie';
        paramMovie.value = this.options.fallbackSrc;
        cam.appendChild(paramMovie);
      // } else {
        cam.data = this.options.fallbackSrc;
      // }

      (function register(run) {
        if (cam.capture !== undefined) {
          const dispather = {
            capture: function (x) {
              try {
                return cam.capture(x);
              } catch (e) {
              }
            },
            save: function (x) {
              try {
                return cam.save(x);
              } catch (e) {
              }
            },
            setCamera: function (x) {
              try {
                return cam.setCamera(x);
              } catch (e) {
              }
            },
            getCameraList: function () {
              try {
                return cam.getCameraList();
              } catch (e) {
              }
            }
          };
          self.onSuccess(dispather);

        } else if (run === 0) {
          self.onError(new Error('Flash movie not yet registered!'));
        } else {
          // Flash interface not ready yet
          window.setTimeout(register, 1000 * (4 - run), run - 1);
        }
      }(3));
    }
    else {
      console.error('WebCam options is require');
    }
  }

  /**
   * Start capturing video stream
   * @returns {any}
   */
  startCapturingVideo(): any {
    if (this.isSupportWebRTC) {
      return this.onWebRTC();
    }

    if (this.isFallback) {
      return this.onFallback();
    }
    console.error('WebCam not supported');
  }
}

export default WebCamComponent;
