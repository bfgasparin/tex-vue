import Storage from '../services/Storage'

export default class BackgroundTasks {
  constructor () {
    this.runningTasks = 0
    this.loopIntervalSeconds = 30 // lower for tests
    this.startIntervalSeconds = 1
    this.restartSeconds = 90
  }

  run () {
    setTimeout(this.runCycle.bind(this), this.startIntervalSeconds * 1000)
    setInterval(this.runCycle.bind(this), this.loopIntervalSeconds * 1000)
  }

  runCycle () {
    if (this.runningTasks !== 0) {
      let lastTime = Storage.get('last_task_update_time')
      let currentTime = (new Date()).getTime() / 1000 | 0
      let diff = currentTime - lastTime
      if (diff > this.restartSeconds) {
        this.runningTasks = 0
        Storage.set('last_update_error_time', lastTime)
      } else {
        return // wait for it to finish running
      }
    }

    this.runningTasks = 0

    Storage.set('last_task_update_time', ((new Date()).getTime() / 1000 | 0))

    this.incrementTaskCounter()
    // this.runTask(UpdateWalletsTask)
    // this.runTask(PollExchangeTask)
    // this.runTask(UpdateOrdersTask)
    // this.runTask(EthereumGasPriceUpdateTask)
    // this.decrementTaskCounter()

    // todo: what if this cycle gets broken? should have some msg or something
  }

  incrementTaskCounter () {
    this.runningTasks++
  }
  decrementTaskCounter () {
    this.runningTasks--
  }

  runTask (TaskClass) {
    this.incrementTaskCounter()

    // let task = new TaskClass()
    // task.attachDone(this.decrementTaskCounter.bind(this))
    // task.attachApp(this.app)
    // task.run()
  }
}
