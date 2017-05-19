import { NgModule, CUSTOM_ELEMENTS_SCHEMA }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { PbSpinwheelComponent } from './pb-spinwheel/pb-spinwheel.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, PbSpinwheelComponent ],
  bootstrap:    [ AppComponent ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
