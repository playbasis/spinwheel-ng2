# PbSpinwheel

PbSpinwheel is port version to Angular 2 from [spinwheel-js](https://github.com/playbasis/spinwheel-js).
It's based on Angular 2 `2.4.0` with typescript `2.3.2` and transpire down to ES2015.

# Overview

PbSpinwheel component uses [playbasis.js](https://github.com/playbasis/native-sdk-js) internally.  
It accepts api-key and api-secret from element's property in Angular 2 or HTML element attribute in its template code. Then it will use those information to build Playbasis environment to be ready to utilize its API calls internally.

It's reccommended for the app to use the same api-key, and api-secret as PbSpinwheel, although not strictly force.

It notifies events by using `Subject` of `rxjs`.

# Development

Notable two commands that you might frequently use it along the development.

* Develop

    Execute `npm run start` to start local http server then at the same time build project then watch for any changes. You can further develop then see result made from changes of code you added at http://localhost:3000.

* Lint

    Execute `npm run lint` to lint the source code.

# License

Copyrights, Playbasis.
