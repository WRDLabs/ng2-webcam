import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule }    from '@angular/http';
import { WebCamComponent } from '../../index';

import AppComponent   from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    WebCamComponent
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
class AppModule {
}
export default AppModule;
