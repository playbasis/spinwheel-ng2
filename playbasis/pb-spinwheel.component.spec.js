"use strict";
var testing_1 = require('@angular/core/testing');
var pb_spinwheel_component_1 = require('./pb-spinwheel.component');
describe('PbSpinwheelComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [pb_spinwheel_component_1.PbSpinwheelComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(pb_spinwheel_component_1.PbSpinwheelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should be created', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=pb-spinwheel.component.spec.js.map