import ajax from 'ajax-promise'

export default class ourown {
  static getBaseUri (code) {
    return 'http://localhost:5000/api/v1/blockchain/' + code.toUpperCase() + '/'
  }

  static getTransactionsMultiAddress (code, addresses, callback) {
    let url = this.getBaseUri(code) + 'addresses/?addresses=' + addresses.join(',')
    ajax.get(url).then((response) => {
      console.log(response)

      let result = {'addresses': response.balances, 'txs': []}
      callback(result)
    }).catch((e) => {
      console.log(e)
      throw e
    })
  }
}
