# WDIO SIMPLE Reporter
> A WebdriverIO plugin. Report results in json format.

This project is inspired by the [wdio-json-reporter](https://github.com/fijijavis/wdio-json-reporter).

## Installation

The easiest way is to keep `wdio-simple-reporter` as a devDependency in your `package.json`.

```
{
  "devDependencies": {
    "wdio-simple-reporter": "~0.1.1"
  }
}
```

You can simple do it by:

```
npm install wdio-simple-reporter --save
```

Instructions on how to install `WebdriverIO` can be found [here](http://webdriver.io/guide/getstarted/install.html).

## Configuration

Following code shows the default wdio test runner configuration.

```
// wdio.conf.js
var simpleReporter = require('wdio-simple-reporter').SimpleReporter
...
module.exports = {
  // ...
  reporters: ['dot', simpleReporter],
  reporterOptions: {
    resultsDir: './reports'
    resultsFile: 'report.json'
  },
  // ...
};
```

`resultsDir` - directory to store results file. Default value `reports`, so results will be stored in `<path-to-your-project>/node_modules/wdio-simple-reporter/reports/report.json` file.

`resultsFile` - file to store results. Default value `report.json`.

## Development

All commands can be found in the package.json. The most important are:

Build package:

```
npm build
```

## Sample Output

```
[
    {
        "cid": "0-0",
        "capabilities": {
            "maxInstances": 1,
            "browserName": "chrome",
            "chromeOptions": {
                "args": [
                    "--disable-notifications",
                    "--enable-automation"
                ]
            }
        },
        "runnerTestsNumber": {
            "failing": 1,
            "passing": 1,
            "pending": 1
        },
        "specFileHash": "04fa2bf3e5eebf36b320ff69c18fde72",
        "specFilePath": [
            "../src/test/test.js"
        ],
        "suites": [
            {
                "type": "suite",
                "start": "2017-03-23T11:51:53.707Z",
                "_duration": 8316,
                "uid": "Suite #13",
                "title": "Suite #1",
                "tests": {
                    "Test #1: success5": {
                        "type": "test",
                        "start": "2017-03-23T11:51:53.709Z",
                        "_duration": 1281,
                        "uid": "Test #1: success5",
                        "title": "Test #1: success",
                        "state": "pass",
                        "screenshots": [],
                        "output": [...],
                        "end": "2017-03-23T11:51:54.990Z"
                    },
                    "Test #2: failes8": {
                        "type": "test",
                        "start": "2017-03-23T11:51:54.990Z",
                        "_duration": 7032,
                        "uid": "Test #2: failes8",
                        "title": "Test #2: failes",
                        "state": "fail",
                        "screenshots": [],
                        "output": [...],
                        "error": {
                            "message": "element (#id1) still not visible after 3000ms",
                            "stack": "Error: element (#id1) still not visible after 3000ms\n    at Context.<anonymous> (src/test/test.js:18:17)\n    at new Promise (node_modules/core-js/library/modules/es6.promise.js:191:7)\n    at elements(\"#id1\") - isVisible.js:54:17\n    at isVisible(\"#id1\") - waitForVisible.js:37:22",
                            "type": "WaitUntilTimeoutError"
                        },
                        "end": "2017-03-23T11:52:02.022Z",
                        "failureScreenshot": {
                            "event": "runner:screenshot",
                            "cid": "0-0",
                            "specs": [
                                "../src/test/test.js"
                            ],
                            "filename": "ERROR_chrome_2017-03-23T11-52-01.602Z.png",
                            "data": <base64 encoded screenshot>,
                            "title": "Test #2: failes",
                            "uid": "Test #2: failes8",
                            "parent": "Suite #1",
                            "parentUid": "Suite #13",
                            "time": "2017-03-23T11:52:02.021Z",
                            "specHash": "04fa2bf3e5eebf36b320ff69c18fde72"
                        }
                    },
                    "Test #3: skipped11": {
                        "type": "test",
                        "start": "2017-03-23T11:52:02.022Z",
                        "_duration": 1,
                        "uid": "Test #3: skipped11",
                        "title": "Test #3: skipped",
                        "state": "pending",
                        "screenshots": [],
                        "output": [],
                        "end": "2017-03-23T11:52:02.023Z"
                    }
                },
                "hooks": {
                    "\"before all\" hook4": {
                        "type": "hook",
                        "start": "2017-03-23T11:51:53.707Z",
                        "_duration": 1,
                        "uid": "\"before all\" hook4",
                        "title": "\"before all\" hook",
                        "parent": "Suite #1",
                        "parenUid": "Suite #13",
                        "end": "2017-03-23T11:51:53.708Z"
                    }
                },
                "end": "2017-03-23T11:52:02.023Z"
            }
        ]
    }
]
```

***

For more information on WebdriverIO see the [homepage](http://webdriver.io/).
