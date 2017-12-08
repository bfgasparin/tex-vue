import ajax from 'ajax-promise'
import axios from 'axios'
import _ from 'lodash'

export default class InsightLitecore {
  static getMaximumAddressesPerRequest () {
    return 3 // lower for tests, for prod might be 15
  }

  static getBaseUri () {
    return 'https://insight.litecore.io/api/'
  }

  static getTransactionsMultiAddress (code, addresses, callback) {
    // split in packs
    let addressesInChunks = _.chunk(addresses, this.getMaximumAddressesPerRequest())

    let calls = []
    for (let i in addressesInChunks) {
      let chunk = addressesInChunks[i]
      calls.push(axios.get(this.getBaseUri(code) + 'addrs/' + chunk.join(',') + '/txs'))
    }
    for (let i in addresses) {
      let address = addresses[i]
      calls.push(axios.get(this.getBaseUri(code) + 'addr/' + address + '/unconfirmedBalance'))
      calls.push(axios.get(this.getBaseUri(code) + 'addr/' + address + '/balance'))
    }

    axios.all(calls).then(axios.spread((...responses) => {
      let result = {
        txs: [],
        addresses: []
      }
      let addressBalancesMap = {}

      for (let i in responses) {
        let response = responses[i]
        if (response.status !== 200) throw new Error('Error while connecting to ' + this.getBaseUri(code) + ', status: ' + response.status + ', expected: 200')

        if (_.includes(response.request.responseURL, 'alance')) {
          // saving into map
          let balance = response.data
          let address = /addr\/(.*?)\/(unconfirmedB|b)alance/g.exec(response.request.responseURL)[1]

          addressBalancesMap[address] = (addressBalancesMap[address] || 0) + balance
        } else if (_.includes(response.request.responseURL, '/txs')) {
          result.txs = result.txs.concat(response.data.items)
        }
      }

      // adapting balances to the format of the receiver
      for (let addr in addressBalancesMap) {
        result.addresses.push({
          address: addr,
          balance: addressBalancesMap[addr]
        })
      }

      callback(result)
    }))
  }

  static pushtx (hex, options) {
    return ajax.post(this.getBaseUri() + 'tx/send', {rawtx: hex})
  }
}
