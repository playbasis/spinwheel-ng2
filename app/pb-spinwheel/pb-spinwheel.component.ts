import { Component, OnInit, Input, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['pb-spinwheel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PbSpinwheelComponent implements OnInit {

  // component name the same as int @Component's selector
  public static componentName: string = 'pb-spinwheel';

  // -- public event for user to subscribe
  public onReadySubject: Subject<any>;
  public onErrorSubject: Subject<any>;
  public onSuccessSubject: Subject<any>;
  public onKnownResultRewardSubject: Subject<any>;

  public spinChanceLeft: number = 1;
  public isLoaded: boolean = false;

  private _degree: number = 1800;
  private _kOdds: Array<number> = [0, 1, 3, 5, 7, 9, 11, 13, 15];
  private _rewards: Array<any> = [];
  private _gotRewardItem: any = null;
  private _targetSelectionIndex: number;
  private _spinButtonDisabled: boolean = true;
  private _kParamName: string = "url";
  private _spinChanceSuccessCount: number = 0;
  private _rule: any = null;
  private _targetSectionIndex: number = -1;
  @ViewChild('pbInnerwheel') private _elInnerWheel:ElementRef;
  @ViewChild('pbSpinwheelButton') private _elSpinwheelButton:ElementRef;

  @Input('player-id') public playerId: string;
  @Input('env-point-reward-levels') public envPointRewardLevels: any = {level2: 10, level3: 30, level4: 60};
  @Input('env-target-action') public envTargetAction: string = 'click';
  @Input('env-target-tag') public envTargetTag: string = 'spin-wheel';
  @Input('env-custom-param-url-values') public envCustomParamUrlValues: Array<string> = ['spin-wheel1', 'spin-wheel2', 'spin-wheel3'];
  @Input('total-spin-chance') public totalSpinChance: number = 1;
  @Input('api-key') public apiKey: string;
  @Input('api-secret') public apiSecret: string;
  @Input('show-debug-log') public showDebugLog: boolean = false;

  constructor() { }

  ngOnInit() {
    this.dlog("ngOnInit");

    // firstly disable button
    this.disableSpinButton();

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
      let e = this._createErrorObject("Playbasis environment is not built yet", PbSpinwheelErrorCode.PLAYBASIS_NOT_BUILD);
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
   * Create an error object.
   * @param  {string} msg  Message
   * @param  {number} code Error code
   * @return {Error}       Newly created error object created from input message, and code
   */
  _createErrorObject(msg: string, code: number) : Error {
    let e = new Error(msg);
    e['code'] = code;
    return e;
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

        // find possible rules
        var rules = selfObj.findRulesWithTargetTagAndHaveCustomUrlValuesThatPassedUrlValuesCriteria(result.response, selfObj.envCustomParamUrlValues);
        // get a random rule to play with
        selfObj._rule = selfObj.getRandomRuleToPlay(rules);

        selfObj.dlog("got rule: ", selfObj._rule);

        if (selfObj._rule == null) {
          selfObj.dlog("there's no rule to play with");

          // do nothing as css already showed the initial state of spinwheel
          // fire error event to let users knows
          let e = this._createErrorObject("There is no applicable rule for spinwheel.", PbSpinwheelErrorCode.NO_APPLICABLE_RULE);
          selfObj.notifyEvent(selfObj.onErrorSubject, e);
        }
        else {
          selfObj.dlog("got rule to play with");

          // find all rewards from rule
          selfObj.findAllRewardsFromRuleThenSave(selfObj._rule);
          // shuffle rewards
          selfObj.shuffleRewards();

          selfObj.dlog("shuffle");
          selfObj.dlog(selfObj._rewards);

          // generate reward DOM
          selfObj.generateAndAddRewardHTMLElement_to_spinWheelSection();

          // allow user to spin (if total spin chance is set propertly too)
          if (this.spinChanceLeft > 0) {
            selfObj.enableSpinButton();
          }

          // set that it successfully loaded
          // this will mark that spin wheel is successfully loaded and will render
          // each sections on the wheel necessarily
          selfObj.isLoaded = true;

          // fire ready event with all possible rewards information
          selfObj.notifyEvent(selfObj.onReadySubject, selfObj._rewards);
        }
      }, (e: any) => {
        selfObj.dlog("error fetching all rules. " + e.code + ", " + e.message);
        selfObj.notifyEvent(selfObj.onErrorSubject, e);
      });
  }

  /**
   * Begin spinwheel flow
   */
  beginSpinWheelFlow() {
    this.dlog("_spinButtonDisabled: " + this._spinButtonDisabled);

    if (!this._spinButtonDisabled) {
      this.disableSpinButton();

      this.executeEngineRuleToGetRewardId()
        .then((result: any) => {

          // check if we got reward back
          if (result == null) {
            let e = this._createErrorObject("Result is null", PbSpinwheelErrorCode.NO_REWARD_RESULT);
            this._internalErrorCallback(e);
            this.notifyEvent(this.onErrorSubject, e);
            return; // not to anymore proceed
          }
          // check if there's at least 1 reward event so we can mark
          if (result.response.events.length == 0) {
            let e = this._createErrorObject("Result rewards object has empty reward", PbSpinwheelErrorCode.EMPTY_REWARD_EVENT_RESULT);
            this._internalErrorCallback(e);
            this.notifyEvent(this.onErrorSubject, e);
            return; // not to anymore proceed
          }

          // save got-reward
          // support only 1 reward from reward group set in dashboard
          this._gotRewardItem = result.response.events[0];

          // mark target section index
          this.markTargetSectionIndex();

          // spin the wheel
          this.spinWheel(this.getRotationAngleForTargetSectionIndex(this._targetSectionIndex));
        }, (e: any) => {
          this.dlog(e);
          this._internalErrorCallback(e);
          this.notifyEvent(this.onErrorSubject, e);
        });

      this.dlog("clicked to spin");
    }
  }

  /**
   * Get rotation angle within a target section index
   * @param {number} index Section index number
   * @return {number}  Angle in degree
   */
  getRotationAngleForTargetSectionIndex(index: number): number {
    // section angle
    // this is a disect of total sections that it's easy for this method to spin the wheel
    let halfSectionAngle = 360 / this._rewards.length / 2;

    // min angle (inclusive), and max angle (exclusive) to spin to
    let minAngle;
    let maxAngle;

    this.dlog("kOdds: ", this._kOdds);

    // special case for section index 0
    // its both half section is on both side of spinning direction
    // to go to another half (right half), we need to find correct angle, and we can't use negative angle as general direction of spinning is to the left
    if (index == 0) {
      // random which half spin wheel should go
      let isGoRight = Math.floor(Math.random() * 2) == 0 ? false : true;
      if (isGoRight) {
        minAngle = this._kOdds[this._rewards.length] * halfSectionAngle;
        maxAngle = 360.01;  // at the beginning

        this.dlog("target index at 0: go right");
        this.dlog("minAngle: " + minAngle + ", maxAngle: " + maxAngle);
      }
      else {
        minAngle = 0;
        maxAngle = halfSectionAngle;

        this.dlog("target index at 0: go left");
        this.dlog("minAngle: " + minAngle + ", maxAngle: " + maxAngle);
      }
    }
    else {
      minAngle = this._kOdds[index] * halfSectionAngle;
      maxAngle = this._kOdds[index+1] * halfSectionAngle;

      this.dlog("minAngle: " + minAngle + ", maxAngle: " + maxAngle);
    }

    // return the calculated angle within the acceptable range
    var retAngle = Math.floor(Math.random() * (maxAngle-minAngle)) + minAngle;
    this.dlog("spin to angle: " + retAngle);
    return retAngle;
  }

  /**
   * Shuffle rewards array
   */
  shuffleRewards() {
    this.shuffle(this._rewards);
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
   * @return {any} Promise Object
   */
  executeEngineRuleToGetRewardId(): any {
    let playerId = this.playerId;

    // if player id is not set properly yet, then return Promise's reject object immediately
    if (playerId == null ||
        playerId == "") {
      
      let e = this._createErrorObject("Player Id is not set prior to attaching " + PbSpinwheelComponent.componentName + " in the DOM. Set it by using 'player-id=<player-id>' as attribute in <pb-spinwheel> HTML element.", PbSpinwheelErrorCode.PLAYER_ID_NOT_SET);
      
      // return Promise object
      return new Promise( (resolve, reject) => {
        return reject(e);
      });
    }

    let selfObj = this;
    return new Playbasis.Promise( (resolve: any, reject: any) => {
      Playbasis.engineApi.rule(selfObj.envTargetAction, playerId, { url: selfObj._rule.urlValue })
        .then((result: any) => {

          selfObj.dlog("success rule for spin wheel");
          selfObj.dlog(result);

          return resolve(result);
        }, (e: any) => {
          selfObj.dlog(e);

          return reject(new Playbasis.Promise.OperationalError("failed on engine rule action: " + selfObj.envTargetAction + ", for playerId: " + playerId + ", urlValue: " + selfObj._rule.urlValue));
        });
    });
  }

  /**
   * Mark which section index is the result reward user should get.
   */
  markTargetSectionIndex() {
    // check reward type first
    // if it's goods, then we need to check against goodsId
    // otherwise if it's point-based, then we need to check against "reward_name" and "quantity"
    // in short check via "reward_name", and "value" => "reward_name", and "quantity"
    // note: support only 1 reward from reward group set in dashboard
    var type = -1;
    var rewardType = this._gotRewardItem.reward_type;
    var rewardValToCheckAgainst;
    var isGoodsGroup = false;

    this.dlog("mark");
    this.dlog(this._gotRewardItem);

    // be aware that the code doesn't support goods group
    // as goods group's id is dynamically generated thus goods id received as reward is different from one checking from rules
    if (rewardType == "point") {
      type = 1;
      rewardValToCheckAgainst = this._gotRewardItem.value;

      this.dlog("mark: point type -> value: " + rewardValToCheckAgainst);
    }
    else if (rewardType == "goods") {
      type = 2;

      // check if it's goods group or not as its id will be different
      if (this._gotRewardItem.reward_data.group != null) {
        rewardValToCheckAgainst = this._gotRewardItem.reward_data.group;
        isGoodsGroup = true;
      }
      // direct reward item
      else {
        rewardValToCheckAgainst = this._gotRewardItem.reward_data.goods_id;
        isGoodsGroup = false;
      }

      this.dlog("mark: goods type -> goods_id: " + rewardValToCheckAgainst);
    }
    else if (rewardType == "badge") {
      type = 3;
      rewardValToCheckAgainst = this._gotRewardItem.reward_data.badge_id;

      this.dlog("mark: badge type -> badge_id: " + rewardValToCheckAgainst);
    }
    // otherwise the normal point-based reward
    else {
      type = 4;
      rewardValToCheckAgainst = this._gotRewardItem.value;

      this.dlog("mark: point-based type -> value: " + rewardValToCheckAgainst);
    }

    this.dlog("final");
    this.dlog(this._rewards);

    // find the matching reward in the pool of rewards we got from the rule
    // checking against either value for point-based, or goods_id for goods
    for (var i=0; i<this._rewards.length; i++) {
      var reward = this._rewards[i];
      if (type == 1 && reward.reward_name == "point") {
        if (reward.quantity == rewardValToCheckAgainst) {
          this._targetSectionIndex = i;

          this.dlog("found target section index at: " + this._targetSectionIndex);
          break;
        }
      }
      else if (type == 2 && reward.reward_name == "goods") {

        // handling for either it's goods group, or direct goods
        // get base value to check against
        var baseCheckGoodsValue;
        if (isGoodsGroup) {
          baseCheckGoodsValue = reward.data.group;
        }
        else {
          baseCheckGoodsValue = reward.data.goods_id;
        }

        if (baseCheckGoodsValue == rewardValToCheckAgainst) {
          this._targetSectionIndex = i;

          this.dlog("found target section index at: " + this._targetSectionIndex);
          break;
        }
      }
      else if (type == 3 && reward.reward_name == "badge") {
        if (reward.data.badge_id == rewardValToCheckAgainst) {
          this._targetSectionIndex = i;

          this.dlog("found target section index at: " + this._targetSectionIndex);
          break;
        }
      }
      else if (type == 4) {
        if (reward.quantity == rewardValToCheckAgainst) {
          this._targetSectionIndex = i;

          this.dlog("found target section index at: " + this._targetSectionIndex);
          break;
        }
      }
    }

    if (this._targetSectionIndex == null) {

      this.dlog("_targetSectionIndex is null");
      this.dlog("type = " + type);
    }
    else {
      this.dlog(this._targetSectionIndex);

      // fire result reward event
      this.notifyEvent(this.onKnownResultRewardSubject, this._rewards[this._targetSectionIndex]);
    }
  }

  /**
   * Get spinwheel section styled css string.
   * @param  {number} at    section number
   * @param  {string} color color string
   * @param  {number} total total of section
   * @return {string}       formed string of styled css for specified section
   */
  getSpinWheelSectionCSSString(at: number, color: string, total: number): string {
    let degree = 360 - 360 / total * at;
    return "transform: rotate(" + degree + "deg); -webkit-transform: rotate(" + degree + "deg); -moz-transform: rotate(" + degree + "deg); -o-transform: rotate(" + degree + "deg); -ms-transform: rotate(" + degree + "deg); border-color: " + color + " transparent;";
  }

  /**
   * Generate styled HTML elements and add them into spinwheel
   */
  generateAndAddRewardHTMLElement_to_spinWheelSection() {
    // get native element of innerwheel
    let innerWheel = this._elInnerWheel.nativeElement;

    // loop throgh all rewards and generate new tag
    for (let i=0; i<this._rewards.length; i++) {
      let reward = this._rewards[i];

      // create a new element div, and add 'sec' as class attribute
      let newElem = document.createElement("div");
      newElem.className += "sec " + "sec-" + this._rewards.length + " " + PbSpinwheelComponent.componentName;

      // handle generating color for total odd section
      // we have to introduce 3rd color
      let color;
      if (this._rewards.length % 2 != 0) {
        // 3 color possibles
        if (this._rewards.length == 5) {
          if (i == this._rewards.length - 1) {
            color = "#cccccc";
          }
          else if (i % 2 == 0) {
            color = "#d6d6d6";
          }
          else {
            color = "#bebebe";
          }
        }
        // 2 color possibles
        else if (this._rewards.length == 7) {
          if (i == this._rewards.length - 1) {
            color = "#d6d6d6";
          }
          else if (i % 3 == 0) {
            color = "#cccccc";
          }
          else if (i % 3 == 1) {
            color = "#d6d6d6";
          }
          else if (i % 3 == 2) {
            color = "#bebebe";
          }
        }
      }
      // otherwise switch between two colors
      else {
        if (i % 2 == 0) {
          color = "#d6d6d6";
        }
        else {
          color = "#bebebe";
        }
      }
      newElem.setAttribute("style", this.getSpinWheelSectionCSSString(i, color, this._rewards.length));
      newElem.setAttribute('data-index', i + '');

      // create a child span element
      let spanElem = document.createElement("span");
      spanElem.className += "fa flag-icon " + PbSpinwheelComponent.componentName;

      // if it's goods, or badge then it has image
      if (reward.reward_name == "goods" ||
        reward.reward_name == "badge") {
        spanElem.setAttribute("style", "background-image: url(" + reward.data.image + ");");
      }
      else if (reward.reward_name == "point") {
        // check which point image to show on spin wheel
        let quantity = reward.quantity;
        let kPointLevels = this.envPointRewardLevels;
        let image;
        if (quantity >= kPointLevels.level4) {
          image = "../assets/starpoint_4.png";
        }
        else if (quantity >= kPointLevels.level3) {
          image = "../assets/starpoint_3.png";
        }
        else if (quantity >= kPointLevels.level2) {
          image = "../assets/starpoint_2.png";
        }
        else {
          image = "../assets/starpoint_1.png";
        }

        spanElem.setAttribute("style", "background-image: url(" + image + ");");
      }
      // other wise use level 1 point base
      // TODO: Add more resource here
      else {
        let image = "../assets/starpoint_1.png";
        spanElem.setAttribute("style", "background-image: url(" + image + ");");
      }

      newElem.appendChild(spanElem);

      // add newly created element to DOM
      innerWheel.appendChild(newElem);
    }
  }

  /**
   * Find all rewards from rule then save it internally
   * @param {any} rule rule Object
   */
  findAllRewardsFromRuleThenSave(rule: any) {
    // access customized object via .rule to get jigsaw_set
    let jigsawSet = rule.rule.jigsaw_set;

    for (let i=0; i<jigsawSet.length; i++) {
      let jigsaw = jigsawSet[i];

      // find rewards group
      if (jigsaw.category == "GROUP") {

        // save all rewards
        this._rewards = jigsaw.config.group_container;

        this.dlog("save all rewards. Reward count " + this._rewards.length);
      
        break;  
      }
    }
  }

  /**
   * Find rules that passed the criteria we've set
   * @param  {any}        rulesResponse   rules resposne JSON Object as returned directly from Playbasis API call
   * @param  {Array<string>} customUrlValues array of custom url values
   * @return {Array<any>}                 array of rules that passed the criteria
   */
  findRulesWithTargetTagAndHaveCustomUrlValuesThatPassedUrlValuesCriteria(rulesResponse: any, customUrlValues: Array<string>): Array<any> {
    var rules: Array<any> = [];

    // search for rules that has tag `targetTag`
    // this is to automatic search for all possible rules for executing
    // with spin wheel
    for (var i=0; i<rulesResponse.length; i++) {
      var r = rulesResponse[i];

      // return -1 if not found
      if (r.tags.search(this.envTargetTag) != -1) {
        // only if this rule has url param set
        if (r.jigsaw_set != null) {
          for (var j=0; j<r.jigsaw_set.length; j++) {
            var jigsaw = r.jigsaw_set[j];

            // only condition via customParameter
            if (jigsaw.name == "customParameter" &&
              jigsaw.category == "CONDITION" &&
              jigsaw.config.param_name == this._kParamName &&
              jigsaw.config.param_operation == "=") {

              // if this jigsaw contains custom url value as we set
              // via config service, then we include it in
              for (var k=0; k<customUrlValues.length; k++) {
                if (jigsaw.config.param_value == customUrlValues[k]) {
                  // push to our qualified rule
                  // create a customize object here {rule:, urlValue:}
                  rules.push({rule: r, urlValue: jigsaw.config.param_value });

                  this.dlog("save rule with urlValue: " + jigsaw.config.param_value);

                  // match first matched of urlParamValues is enough
                  continue;
                }
              }
            }
          }
        }
      }
    }

    return rules;
  }

  /**
   * Get random rule to play
   * @param {Array<any>} rules array of rules
   * @return {any}  randomized rule object to play
   */
  getRandomRuleToPlay(rules: Array<any>): any {
    if (rules == null)
      return null;
    else if (rules.length == 0)
      return null;

    // after all, all good to go
    let rIndex = Math.floor(Math.random() * rules.length);
    return rules[rIndex];
  }

  /**
   * Get the current rotation angle in degrees from specified element
   * @param  {any} element HTML element
   * @return {number}         current rotation angle of element in degrees
   */
  getCurrentRotation(element: any): number {
    let st = window.getComputedStyle(element, null);
    let tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "fail...";
    let angle;

    if (tr != "none") {
      let values = tr.split('(')[1];
      let values2 = values.split(')')[0];
      let values3 = values2.split(',');
      let a = parseFloat(values3[0]);
      let b = parseFloat(values3[1]);

      let radians = Math.atan2(b, a);

      if (radians < 0) {
        radians += (2 * Math.PI);
      }

      angle = Math.round(radians * (180/Math.PI));
    }
    else {
      angle = 0;
    }

    return angle;
  }

  /**
   * Add event listener to transition end event for inner wheel element
   * It will listen to all possible events that can be across different browsers.
   */
  addEventListenerOfTransitionEndToInnerWheelElement() {
    let events = ["transitionend", "webkitTransitionEnd", "otransitionend", "oTransitionEnd", "msTransitionEnd"];
    let innerWheelElem = this._elInnerWheel.nativeElement;

    let selfObj = this;

    for (var i=0; i<events.length; i++) {

      innerWheelElem.addEventListener(events[i], () => {
        selfObj.dlog("spinning wheel completes for event: " + events[i]);
        selfObj.dlog("rotation stopped at " + selfObj.getCurrentRotation(innerWheelElem));

        // we get result of reward
        // send back though callback
        selfObj.dlog("getRewardItem: ", selfObj._gotRewardItem);

        // call internal success callback
        selfObj._internalSuccessCallback(selfObj._gotRewardItem);
        // send final result back to user
        selfObj.notifyEvent(selfObj.onSuccessSubject, selfObj._gotRewardItem);
      });
    }
  }

  /**
   * Spin the wheel
   * @param {number} targetDegree target rotation in degrees to rotate the wheel to
   */
  spinWheel(targetDegree: number) {
    this.dlog("spinning wheel");

    // generate random number between 1 - 360, then add to the new degree.
    var newDegree = this._degree * (this._spinChanceSuccessCount + 1);
    var totalDegree = newDegree + targetDegree;

    this._elInnerWheel.nativeElement.style.transform = "rotate(" + totalDegree + 'deg)';
  }

  private _internalSuccessCallback(rewardItem: any) {
    this.dlog("internal success callback is called with reward item: ", rewardItem);

    this._spinChanceSuccessCount++;
    this.spinChanceLeft = this.totalSpinChance - this._spinChanceSuccessCount;
    this.dlog("chance success count is " + this._spinChanceSuccessCount + " from " + this.totalSpinChance);

    // re-enable button again if user didn't use up all chances
    if (this._spinChanceSuccessCount < this.totalSpinChance) {
      this.dlog("re-enable spin button again");
      this.enableSpinButton();
    }
  }

  private _internalErrorCallback(e: any) {
    this.dlog("internal error callback is called with error: ", e);
    this.dlog("re-enable spin button again");
    this.enableSpinButton();
  }

  /**
   * Programmatically disable spin button.
   * It will disallow user to touch on it to spin the wheel.
   */
  disableSpinButton() {
    this._spinButtonDisabled = true;
    this._elSpinwheelButton.nativeElement.disabled = true;
  }

  /**
   * Programmatically enable spin button.
   * It will allow user to touch on it to spin the wheel.
   */
  enableSpinButton() {
    this._spinButtonDisabled = false;
    this._elSpinwheelButton.nativeElement.disabled = false;
  }
}
