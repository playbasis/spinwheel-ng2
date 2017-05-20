import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import * as _ from 'playbasis.js';

// to suppress tsc compilation error, and move forward
let Playbasis: any = _;

// error code used for onErrorSubject's error Object
const enum PbSpinwheelErrorCode {
  PLAYBASIS_NOT_BUILD = 1,       // playbasis environment was not built yet
  NO_APPLICABLE_RULE,          // no applicable rule can be found to use with spin wheel
  PLAYER_ID_NOT_SET,           // player id is not set prior to attaching component HTML element in the DOM
  NO_REWARD_RESULT,            // there was no reward returned
  EMPTY_REWARD_EVENT_RESULT    // events result from reward is empty
}

@Component({
  selector: 'pb-spinwheel',
  moduleId: module.id,  // module.id is a key here for relative path of templateUrl, and styleUrls
  templateUrl: 'pb-spinwheel.component.html',
  styleUrls: ['pb-spinwheel.component.css']
})
export class PbSpinwheelComponent implements OnInit {

  // -- public event for user to subscribe
  public onReadySubject: Subject<any>;
  public onErrorSubject: Subject<any>;
  public onSuccessSubject: Subject<any>;
  public onKnownResultRewardSubject: Subject<any>;

  public spinChanceLeft: number = 1;

  private _isLoaded: boolean = false;
  private _isShowDebugLog: boolean = true;
  private _degree: number = 1800;
  private _kOdds: Array<number> = [0, 1, 3, 5, 7, 9, 11, 13, 15];
  private _rewards: Array<any> = [];
  private _gotRewardItem: any = null;
  private _targetSelectionIndex: number;
  private _spinButtonDisabled: boolean = true;
  private _kParamName: string = "url";
  @ViewChild('innerwheel') private elInnerWheel:ElementRef;
  private _spinChanceSuccessCount: number = 0;

  @Input('player-id') playerId: string;
  @Input('env-point-reward-levels') envPointRewardLevels: Object = {level2: 10, level3: 30, level4: 60};
  @Input('env-target-action') envTargetAction: string = 'click';
  @Input('env-target-tag') envTargetTag: string = 'spin-wheel';
  @Input('env-custom-param-url-values') envCustomParamUrlValues: Array<string> = ['spin-wheel1', 'spin-wheel2', 'spin-wheel3'];
  @Input('total-spin-chance') totalSpinChance: number = 1;
  @Input('api-key') apiKey: string;
  @Input('api-secret') apiSecret: string;
  @Input()
    set showDebugLog(value: boolean) {
      this._isShowDebugLog = value;
    }
    get showDebugLog(): boolean {
      return this._isShowDebugLog;
    }

  constructor() { }

  ngOnInit() {
    this.dlog("ngOnInit");

    this.onReadySubject = new Subject();
    this.onErrorSubject = new Subject();
    this.onSuccessSubject = new Subject();
    this.onKnownResultRewardSubject = new Subject();

    this.spinChanceLeft = this.totalSpinChance;

    if (this.apiKey != null &&
        this.apiSecret != null) {
      // build playbasis
      Playbasis.builder
        .setApiKey(this.apiKey)
        .setApiSecret(this.apiSecret)
        .build();

      // initialize by load
      this.loadSpinWheelRules();
    }
    else {
      // create an error Object
      let e = new Error("Playbasis environment is not built yet");
      e['code'] = PbSpinwheelErrorCode.PLAYBASIS_NOT_BUILD;
      // notify event
      this._internalErrorCallback(e);
      this.notifyEvent(this.onErrorSubject, e);
    }

    // add listener to its css transition event
    this.addEventListenerOfTransitionEndToInnerWheelElement();
  }

  ngAfterViewInit() {
    this.dlog("ngAfterViewInit");


  }

  /**
   * Debug log wrapper.
   * Function accepts variable arguments.
   * @param {any[]} ...args [description]
   */
  dlog(...args : any[]) {
    if (this.showDebugLog) {
      let length = arguments.length;
      if (length > 0) {
        switch(length) {
          case 1: this._dlog("[pb-spinwheel]", arguments[0]); break;
          case 2: this._dlog("[pb-spinwheel]", arguments[0], arguments[1]); break;
          case 3: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2]); break;
          case 4: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3]); break;
          case 5: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]); break;
          case 6: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]); break;
          case 7: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]); break;
          case 8: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]); break;
          case 9: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]); break;
          case 10: this._dlog("[pb-spinwheel]", arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9]); break;
        }
      }
    }
  }

  private _dlog(...args : any[]) {
    console.log.apply(console, arguments);
  }

  /**
   * Notify event on subject with attached data Object.
   * @param {Object} subject    Subject to call notify on
   * @param {Object} data      Data to attach in notify message
   */
  notifyEvent(subject: Subject<any>, data: Object) {
    subject.next(data);
  }

  /**
   * Begin loading rules for spinwheel
   */
  loadSpinWheelRules() {
    let selfObj = this;

    Playbasis.engineApi.listRules({action: this.envTargetAction})
      .then((result: any) => {

        selfObj.dlog("result: ", result);

        
      }, (e: any) => {
        selfObj.dlog("error fetching all rules. " + e.code + ", " + e.message);

        selfObj.notifyEvent(selfObj.onErrorSubject, e);
      });
  }

  /**
   * Begin spinwheel flow
   */
  beginSpinWheelFlow() {

  }

  /**
   * Get rotation angle within a target section index
   * @param {number} index Section index number
   * @return {number}  Angle in degree
   */
  getRotationAngleForTargetSectionIndex(index: number): number {
    return 0;
  }

  /**
   * Shuffle rewards array
   */
  shuffleRewards() {

  }

  /**
   * Inline shuffle array.
   * Grabbed from http://jsfromhell.com/array/shuffle
   * @param {Array<any>}  a  Input array to do inline shuffle
   */
  private shuffle(a: Array<any>) {
    let j: number, x: any, i: number;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
  }

  /**
   * Get reward id from executing engine rule.
   * @return {Object} Promise Object
   */
  executeEngineRuleToGetRewardId(): Object {
    return null;
  }

  /**
   * Mark which section index is the result reward user should get.
   */
  markTargetSectionIndex() {

  }

  /**
   * Get spinwheel section styled css string.
   * @param  {number} at    section number
   * @param  {string} color color string
   * @param  {number} total total of section
   * @return {string}       formed string of styled css for specified section
   */
  getSpinWheelSectionCSSstring(at: number, color: string, total: number): string {
    let degree = 360 - 360 / total * at;
    return "transform: rotate(" + degree + "deg); -webkit-transform: rotate(" + degree + "deg); -moz-transform: rotate(" + degree + "deg); -o-transform: rotate(" + degree + "deg); -ms-transform: rotate(" + degree + "deg); border-color: " + color + " transparent;";
  }

  /**
   * Generate styled HTML elements and add them into spinwheel
   */
  generateAndAddRewardHTMLElement_to_spinWheelSection() {

  }

  /**
   * Find all rewards from rule then save it internally
   * @param {Object} rule rule Object
   */
  findAllRewardsFromRuleThenSave(rule: Object) {

  }

  /**
   * Find rules that passed the criteria we've set
   * @param  {Object}        rulesResponse   rules resposne JSON Object as returned directly from Playbasis API call
   * @param  {Array<String>} customUrlValues array of custom url values
   * @return {Array<Object>}                 array of rules that passed the criteria
   */
  findRulesWithTargetTagAndHaveCustomUrlValuesThatPassedUrlValuesCriteria(rulesResponse: Object, customUrlValues: Array<String>): Array<Object> {
    return null;
  }

  /**
   * Get random rule to play
   * @param {Array<Object>} rules array of rules
   * @return {Object}  randomized rule Object to play
   */
  getRandomRuleToPlay(rules: Array<Object>): Object {
    return null;
  }

  /**
   * Get the current rotation angle in degrees from specified element
   * @param  {Object} element HTML element
   * @return {number}         current rotation angle of element in degrees
   */
  getCurrentRotation(element: Object): number {
    return 0;
  }

  /**
   * Add event listener to transition end event for inner wheel element
   * It will listen to all possible events that can be across different browsers.
   */
  addEventListenerOfTransitionEndToInnerWheelElement() {

  }

  /**
   * Spin the wheel
   * @param {number} targetDegree target rotation in degrees to rotate the wheel to
   */
  spinWheel(targetDegree: number) {

  }

  private _internalErrorCallback(e: Object) {

  }

  /**
   * Programmatically enable spin button.
   * It will allow user to touch on it to spin the wheel.
   */
  enableSpinButton() {
  }
}
