import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <pb-spinwheel 
      total-spin-chance="5"
      show-debug-log
    ></pb-spinwheel>
  `
})
export class AppComponent {

  ngOnInit() {
  }
}
