"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Rx_1 = require('rxjs/Rx');
var PbSpinwheelComponent = (function () {
    function PbSpinwheelComponent() {
        this._isShowDebugLog = true;
        this.totalSpinChance = 1;
    }
    Object.defineProperty(PbSpinwheelComponent.prototype, "showDebugLog", {
        get: function () {
            return this._isShowDebugLog;
        },
        set: function (value) {
            this._isShowDebugLog = value;
        },
        enumerable: true,
        configurable: true
    });
    PbSpinwheelComponent.prototype.ngOnInit = function () {
        this.onReadySubject = new Rx_1.Subject();
    };
    __decorate([
        core_1.Input('total-spin-chance'), 
        __metadata('design:type', Number)
    ], PbSpinwheelComponent.prototype, "totalSpinChance", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PbSpinwheelComponent.prototype, "showDebugLog", null);
    PbSpinwheelComponent = __decorate([
        core_1.Component({
            selector: 'pb-spinwheel',
            templateUrl: './pb-spinwheel.component.html',
            styleUrls: ['./pb-spinwheel.component.css']
        }), 
        __metadata('design:paramtypes', [])
    ], PbSpinwheelComponent);
    return PbSpinwheelComponent;
}());
exports.PbSpinwheelComponent = PbSpinwheelComponent;
//# sourceMappingURL=pb-spinwheel.component.js.map