import Storage from '../services/Storage'
import Exchange from '../models/Exchange'
import BaseTask from './BaseTask'

export default class PollExchangeTask extends BaseTask {
  run () {
    this.incrementTaskCounter()

    this.exchange = new Exchange(this.app)
    this.exchange.loadFromAPI('poll', (data) => {
      Storage.set('exchange.poll', data, () => {
        this.app.reloadStorage()
      })

      this.decrementTaskCounter()
    })
  }
}
