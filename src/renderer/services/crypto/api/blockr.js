import axios from 'axios'
import _ from 'lodash'

export default class blockr {
  static getMaximumAddressesPerRequest () {
    return 15 // lower for tests
  }

  static getBaseUri (code) {
    return 'https://' + code.toLowerCase() + '.blockr.io/api/v1/'
  }

  static getTransactionsMultiAddress (code, addresses, callback) {
    // split in packs
    let addressesInChunks = _.chunk(addresses, this.getMaximumAddressesPerRequest())

    let calls = []
    for (let i in addressesInChunks) {
      let chunk = addressesInChunks[i]
      calls.push(axios.get(this.getBaseUri(code) + 'address/txs/' + chunk.join(',')))
      calls.push(axios.get(this.getBaseUri(code) + 'address/balance/' + chunk.join(',') + '?confirmations=0'))
    }

    axios.all(calls).then(axios.spread((...responses) => {
      let result = {
        txs: [],
        addresses: []
      }

      for (let i in responses) {
        let response = responses[i]
        if (response.status !== 200) throw new Error('Error while connecting to ' + this.getBaseUri(code) + ', status: ' + response.status + ', expected: 200')
        if (response.data.status !== 'success') throw new Error('Error while parsing data from ' + this.getBaseUri(code) + ', status: ' + response.data.status + ', expected: successs')

        if (_.includes(response.request.responseURL, 'address/balance')) {
          console.log(response.data.data)

          for (let j in response.data.data) {
            let addrInfo = response.data.data[j]
            result.addresses.push({
              address: addrInfo.address,
              final_balance: addrInfo.balance
            })
          }
        } else if (_.includes(response.request.responseURL, 'address/txs')) {
          for (let j in response.data.data) {
            let addrInfo = response.data.data[j]
            result.txs = result.txs.concat(addrInfo.txs)
          }
        }
      }

      callback(result)
    }))
  }
}
