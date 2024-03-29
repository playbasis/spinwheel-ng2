import { Component, ElementRef, ViewChild } from '@angular/core';
import { PbSpinwheelComponent } from './pb-spinwheel/pb-spinwheel.component';

@Component({
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {

	@ViewChild('spinwheel') el_spinwheel:PbSpinwheelComponent;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // Listen to events
    // - on-ready event
  	this.el_spinwheel.onReadySubject.subscribe(data => {
  		console.log('onReady', data);
  	});

    // - on-error event
    this.el_spinwheel.onErrorSubject.subscribe(data => {
      console.log('onError', data);
    });

    // - on-success event
    this.el_spinwheel.onSuccessSubject.subscribe(data => {
      console.log('onSuccess', data);
    });

    // - on-known-result-reward event
    this.el_spinwheel.onKnownResultRewardSubject.subscribe(data => {
      console.log('onKnownResultReward', data);
    });
  }
}
