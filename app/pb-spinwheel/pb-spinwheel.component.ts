import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import * as _ from 'playbasis.js';

@Component({
  selector: 'pb-spinwheel',
  moduleId: module.id,  // module.id is a key here for relative path of templateUrl, and styleUrls
  templateUrl: 'pb-spinwheel.component.html',
  styleUrls: ['pb-spinwheel.component.css']
})
export class PbSpinwheelComponent implements OnInit {

  public onReadySubject: Subject<any>;
  private _isShowDebugLog: boolean = true;

  @Input('total-spin-chance') totalSpinChance: Number = 1;
  @Input()
    set showDebugLog(value: boolean) {
      this._isShowDebugLog = value;
    }
    get showDebugLog(): boolean {
      return this._isShowDebugLog;
    }

  constructor() { }

  ngOnInit() {
    this.onReadySubject = new Subject();

    // -- testing code
    _.builder
        .setApiKey('2043203153')
        .setApiSecret('144da4c8df85b94dcdf1f228ced27a32')
        .build();

    _.authApi.auth()
      .then((result) => {

        _.goodsApi.goodsListInfo({name: 'Goods Group B'})
          .then((_r) => {
            console.log(_r);
            this.onReadySubject.next(_r);
          }, (error) => {
            console.log(error);
          });

      }, (e) => {
        console.log(e);
      });
    // -- end of testing code
  }

}
