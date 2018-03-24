# Example on "How To Use ES6 Code Directly In Browser"

Here is the full-featured example on using ES6 files from PKI.js directly in browser, without any transpilations and combining them via Rollup etc.

In fact the example build "on-top" of another example "CertificateComplexExample". Frankly speaking, does not matter what code to put here - important only is how to "decorate" all internal things things. Some brief description you could file [**here**](https://github.com/PeculiarVentures/PKI.js#how-to-use-pkijs-es6-files-directly-in-browser).

In order to successfully run the example user need to run these commands in console:
```
cd ./examples/HowToUseES6DirectlyInBrowser
npm run build
node app.js
```
These commands would activate local Web server listening on 3001 port. After you open link `localhost:3001` the test application would be fully operating. Almost all moder browsers would support the "native ES6 modules". You could check [**this link to caniuse site**](https://caniuse.com/#feat=es6-module) for current status.