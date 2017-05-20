import { Component, ElementRef, ViewChild } from '@angular/core';
import { PbSpinwheelComponent } from './pb-spinwheel/pb-spinwheel.component';

@Component({
  selector: 'my-app',
  template: `
    <pb-spinwheel #spinwheel
      env-point-reward-levels='{ "level2": 10, "level3": 30, "level4": 60 }'
      env-target-action='click'
      env-target-tag='spin-wheel'
      env-custom-param-url-values='["spin-wheel1", "spin-wheel2", "spin-wheel3"]'
      player-id='jontestuser'
      total-spin-chance='5'
      api-key='2043203153'
      api-secret='144da4c8df85b94dcdf1f228ced27a32'
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
