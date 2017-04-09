import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'
import * as events from 'events'
import * as Utils from './utils'

// 'runner: start' event
type RunnerStart = {
  readonly event: string
  readonly cid: string
  readonly specs: string[]
  readonly capabilities: Capabilities
  readonly config: any
  readonly specHash: string
}

// 'runner: end' event
type RunnerEnd = {
  readonly event: string
  readonly failures: number
  readonly cid: string
  readonly specs: string[]
  readonly specHash: string
}

// 'test: pass | fail | pending' event
// failed tests have err object
type Test = {
  readonly type: string
  readonly err: TestFailedError
  readonly title: string
  readonly parent: string
  readonly pending: boolean
  readonly file: string
  readonly cid: string
  readonly specs: string[]
  readonly event: string
  readonly runner: { [key: string]: Capabilities }
  readonly uid: string,
  readonly parentUid: string,
  readonly specHash: string
}

// 'runner:screenshot' event
type Screenshot = {
  readonly event: string
  readonly cid: string
  readonly specs: string[]
  readonly filename: string
  readonly data: string
  readonly title: string
  readonly uid: string
  readonly parent: string
  readonly parentUid: string
  readonly time: Date
  readonly specHash: string
}

type TestFailedError = {
  readonly message: string
  readonly stack: string
  readonly type: string
}

type SpecStats = {
  readonly type: string
  readonly start: Date
  readonly _duration: number
  readonly uid: string
  readonly files: string[]
  readonly specHash: string[]
  readonly suites: { [key: string]: SuiteStats }
  readonly output: [{ type: string, payload: any }]
  readonly end: Date
}

type SuiteStats = {
  readonly type: string
  readonly start: Date
  readonly _duration: number
  readonly uid: string
  readonly title: string
  readonly tests: { [key: string]: TestStats }
  readonly hooks: { [key: string]: HookStats }
  readonly end: Date
}

type TestStats = {
  readonly type: string
  readonly start: Date
  readonly _duration: number
  readonly uid: string
  readonly title: string
  readonly state: string
  readonly screenshots: any[]
  readonly output: [{ type: string, payload: any }]
  readonly error: TestFailedError
  readonly end: Date
  failureScreenshot: Screenshot
}

type HookStats = {
  readonly type: string
  readonly start: Date
  readonly _duration: number
  readonly uid: string
  readonly title: string
  readonly parent: string
  readonly parenUid: string
  readonly currentTest: string
  readonly error: TestFailedError
  readonly end: Date
}

type RunnerResult = {
  readonly cid: string
  readonly capabilities: Capabilities
  readonly specFilePath: string[]
  readonly specFileHash: string
  readonly runnerTestsNumber: TestsNumber
  suites: SuiteStats[]
}

type TestsNumber = {
  passing: number
  pending: number
  failing: number
}

type Capabilities = {
  readonly browserName: string
  readonly version: string | number
  readonly platform: string
  readonly platformName: string
  readonly platformVersion: string | number
}

type Config = {
  readonly screenshotPath: string
}

type ConfigOptions = {
  readonly resultsDir: string
  readonly resultsFile: string
}

type BaseReporter = {
  readonly stats: ReporterStats
}

type ReporterStats = {
  runners: { [key: string]: RunnerStats }
}

type RunnerStats = {
  type: string
  start: Date
  _duration: number
  uid: string
  cid: string
  capabilities: Capabilities
  sanitizedCapabilities: string
  config: Config
  specs: { [key: string]: SpecStats }
  sessionID: string
}

/**
 * Initialize a new `Simple` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */
export class SimpleReporter extends events.EventEmitter {
  public static reporterName = 'wdio-simple-reporter' // default reporter name

  private resultsDir = '../reports' // default results dir
  private resultsFile = 'report.json' // default results file
  private runnerResults: RunnerResult[] = []
  private failureScreenshots: Screenshot[] = []

  constructor(
    private baseReporter: BaseReporter,
    private config: Config,
    private options: ConfigOptions
  ) {
    super()

    const baseReporterStats = this.baseReporter.stats

    this.on('runner:start', (runner: RunnerStart) => {
      const cid = runner.cid

      const currentRunnerResult: RunnerResult = {
        cid,
        capabilities: runner.capabilities,
        runnerTestsNumber: {
          failing: 0,
          passing: 0,
          pending: 0
        },
        specFileHash: runner.specHash,
        specFilePath: runner.specs,
        suites: []
      }

      this.runnerResults.push(currentRunnerResult)
    })

    this.on('runner:end', (runner: RunnerEnd) => {
      const cid = runner.cid
      const specHash = runner.specHash
      const suites: SuiteStats[] = this.getAllTestSuites(baseReporterStats.runners[cid].specs[specHash])
      this.getRunner(cid).suites = suites
    })

    this.on('end', () => {
      // attach screenshots to corresponding tests
      this.failureScreenshots.map(screenshot => this.runnerResults.map(runnerResult => {
        runnerResult.suites.map(suite => Object.keys(suite.tests).map(test => {
          if (suite.tests[test].uid === screenshot.uid)
            suite.tests[test].failureScreenshot = screenshot
        }))
      }))

      // save final results to json file
      const finalResultsDir = options.resultsDir
        ? options.resultsDir
        : path.join(__dirname, this.resultsDir)
      const finalResultsFile = options.resultsFile
        ? options.resultsFile
        : this.resultsFile
      const fullPath = path.join(finalResultsDir, finalResultsFile)

      try {
        if (!fs.existsSync(finalResultsDir)) mkdirp.sync(finalResultsDir)
        Utils.saveObjectToJson(this.runnerResults, fullPath)
      } catch (e) {
        console.error(`Failed to save report file ${finalResultsFile} `
          + `to ${finalResultsDir} directory.`, e)
      }
    })

    this.on('runner:screenshot', (screenshot: Screenshot) =>
      this.failureScreenshots.push(screenshot)
    )

    this.on('test:pass', (test: Test) =>
      this.getRunner(test.cid).runnerTestsNumber.passing++
    )

    this.on('test:fail', (test: Test) =>
      this.getRunner(test.cid).runnerTestsNumber.failing++
    )

    this.on('test:pending', (test: Test) =>
      this.getRunner(test.cid).runnerTestsNumber.pending++
    )
  }

  private getAllTestSuites(spec: SpecStats) {
    let suites: SuiteStats[] = []

    Object.keys(spec.suites)
      .map(suiteName => suites.push(spec.suites[suiteName]))

    // remove suites with empty tests property
    return suites.filter(suite => Object.keys(suite.tests).length !== 0)
  }

  private getRunner(cid: string) {
    const res = this.runnerResults.find(r => r.cid === cid)
    if (!res) {
      throw new Error(`Results with runner CID ${cid} not found.`)
    }

    return res
  }
}
