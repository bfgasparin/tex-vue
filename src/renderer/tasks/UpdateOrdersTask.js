import OrderRepository from '../models/OrderRepository'
import Exchange from '../models/Exchange'
import Storage from '../services/Storage'
import BaseTask from './BaseTask'

export default class UpdateOrdersTask extends BaseTask {
  run () {
    this.incrementTaskCounter()

    this.exchange = new Exchange(this.app)

    let orderIDs = []
    let orderRecords = OrderRepository.getAllRecords(this.app)
    for (let i in orderRecords) {
      orderIDs.push(orderRecords[i].id)
    }

    let ordersPost = {orders: orderIDs.join(',')}

    this.exchange.loadFromAPIWithData('orderStatus', ordersPost, (data) => {
      // console.log(data);

      Storage.set('exchange.orderStatus', data.orders, () => {
        this.app.reloadStorage()
      })

      this.decrementTaskCounter()
    })
  }
}
