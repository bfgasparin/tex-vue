import ajax from 'ajax-promise'
import BN from 'bignumber.js'

export default class chainso {
  static getURL (code, command, params) {
    return 'https://chain.so/api/v2/' + command + '/' + code + '/' + params.join('/')
  }

  static getRelaxSeconds () {
    return 3
  }

  static getTransactionsMultiAddress (code, addresses, callback, i = 0, responses = []) {
    if (addresses.length === 0) {
      // eslint-disable-next-line
      return callback({addresses: [], txs: []})
    }

    let url = this.getURL(code, 'get_address_balance', [addresses[i], 0]) // 0 conf

    console.log(url)

    let continueFn = (data) => {
      setTimeout(() => {
        responses.push(data)

        if (i === addresses.length - 1) {
          // it was the last one
          this.parseTransactionsMultiAddressResult(responses, code, addresses, callback)
        } else {
          // recursion
          this.getTransactionsMultiAddress(code, addresses, callback, i + 1, responses)
        }
      }, this.getRelaxSeconds() * 1000)
    }

    ajax.get(url).then(continueFn).catch(continueFn)
  }

  static parseTransactionsMultiAddressResult (responses, code, addresses, callback) {
    let result = {addresses: [], txs: []}

    for (let i in responses) {
      let response = responses[i]
      if (response.status !== 'success') throw new Error('Error while parsing response from chain.so, status: ' + response.status + ', expected: 200')

      let addrInfo = response.data

      console.log(addrInfo)

      console.log(addrInfo.unconfirmed_balance)

      result.addresses.push({
        address: addrInfo.address,
        balance: (new BN(parseFloat(addrInfo.unconfirmed_balance))).add(new BN(parseFloat(addrInfo.confirmed_balance))).toNumber()
      })

      // result.txs = result.txs.concat(addrInfo.txrefs);
    }

    console.log(result)

    callback(result)
  }
}
