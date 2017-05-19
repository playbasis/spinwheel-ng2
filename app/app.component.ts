import { Component, ElementRef, ViewChild } from '@angular/core';
import { PbSpinwheelComponent } from './pb-spinwheel/pb-spinwheel.component';

@Component({
  selector: 'my-app',
  template: `
    <pb-spinwheel #spinwheel
      total-spin-chance="5"
      show-debug-log
    ></pb-spinwheel>
  `
})
export class AppComponent {

	@ViewChild('spinwheel') el_spinwheel:PbSpinwheelComponent;

  ngOnInit() {
  }

  ngAfterViewInit() {
  	this.el_spinwheel.onReadySubject.subscribe(data => {
  		console.log('onReady', data);
  	});
  }
}
