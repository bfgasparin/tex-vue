export default class BaseTask {
  constructor () {
    this.taskCounter = 0
  }

  attachDone (done) {
    this.doneCallback = done
  }
  attachApp (app) {
    this.app = app
  }

  incrementTaskCounter () {
    this.taskCounter++
    console.log('Background Tasks Counter: ' + this.taskCounter)
  }
  decrementTaskCounter () {
    this.taskCounter--
    console.log('Background Tasks Counter: ' + this.taskCounter)
    if (this.taskCounter === 0) { // todo: what if the first one gets done really quick? before we get a chance to do one more increment
      this.done()
    }
  }

  done () {
    this.doneCallback()
  }
}
