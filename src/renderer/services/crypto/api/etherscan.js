import ajax from 'ajax-promise'
import BN from 'bignumber.js'
import axios from 'axios'
import _ from 'lodash'

export default class etherscan {
  static getMaximumAddressesPerRequest () {
    return 15 // lower for tests, for prod might be 15
  }

  static getBaseUri () {
    return 'https://api.etherscan.io/api?'
  }

  static getTransactionsMultiAddress (code, addresses, callback) {
    // split in packs
    let addressesInChunks = _.chunk(addresses, this.getMaximumAddressesPerRequest())

    let calls = []
    for (let i in addressesInChunks) {
      let chunk = addressesInChunks[i]
      calls.push(axios.get(this.getBaseUri(code) + 'module=account&action=balancemulti&address=' + chunk.join(',') + '&tag=latest'))
    }
    for (let i in addresses) {
      let address = addresses[i]
      calls.push(axios.get(this.getBaseUri(code) + 'module=account&action=txlist&address=' + address + '&startBlock=0&endBlock=latest&sort=asc'))
      calls.push(axios.get(this.getBaseUri() + 'module=proxy&action=eth_getTransactionCount&address=' + address + '&tag=pending'))
    }

    axios.all(calls).then(axios.spread((...responses) => {
      let result = {
        txs: [],
        addresses: [],
        txCounts: []
      }

      for (let i in responses) {
        let response = responses[i]
        if (response.status !== 200) throw new Error('Error while connecting to ' + this.getBaseUri(code) + ', status: ' + response.status + ', expected: 200')

        if (_.includes(response.request.responseURL, 'balancemulti')) {
          // saving into map
          let balances = response.data.result
          for (let i in balances) {
            let balanceItem = balances[i]
            result.addresses.push({address: balanceItem.account, balance: balanceItem.balance})
          }
        } else if (_.includes(response.request.responseURL, 'txlist')) {
          result.txs = result.txs.concat(response.data.result)
        } else if (_.includes(response.request.responseURL, 'eth_getTransactionCount')) {
          let address = /address=(.*?)&/g.exec(response.request.responseURL)[1]
          result.txCounts.push({address: address, txCount: (new BN(response.data.result)).toNumber()})
        }
      }

      callback(result)
    }))
  }

  static pushtx (hex, options) {
    let calls = []
    for (let i in hex) {
      let txHex = hex[i]
      calls.push(axios.get(this.getBaseUri() + 'module=proxy&action=eth_sendRawTransaction&hex=' + txHex))
    }
    return axios.all(calls)
  }

  static getGasPriceInEthFromAPI (callback) {
    ajax.get(this.getBaseUri() + 'module=proxy&action=eth_gasPrice').then((data) => {
      let wei = 1e18
      let gasPrice = (new BN(data.result)).div(wei).toNumber()
      callback(gasPrice)
    })
  }
}
