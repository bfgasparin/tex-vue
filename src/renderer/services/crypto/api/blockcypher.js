import ajax from 'ajax-promise'

export default class blockcypher {
  static getBaseUri (code) {
    return 'https://api.blockcypher.com/v1/' + code.toLowerCase() + '/main/'
  }

  static getTransactionsMultiAddress (code, addresses, callback) {
    let chain = null
    let responses = []
    for (let i in addresses) {
      let url = this.getBaseUri(code) + 'addrs/' + addresses[i]
      if (chain === null) {
        chain = ajax.get(url)
      } else {
        chain.then((data) => {
          console.log(data)
          responses.push(data)
          chain = ajax.get(url)
        }).catch((e) => {
          console.log(e)
          throw e
        })
      }
    }

    if (chain !== null) {
      chain.then((data) => {
        responses.push(data)

        this.parseTransactionsMultiAddressResult(responses, code, addresses, callback)
      }).catch((e) => {
        throw e
      })
    }
  }

  parseTransactionsMultiAddressResult (responses, code, addresses, callback) {
    console.log(responses)
  }

// axios.all(calls).then(axios.spread((...responses) => {
//             let result = {
//                 txs: [],
//                 addresses: []
//             };
//
//             for(let i in responses) {
//                 let response = responses[i];
//
//                 if (response.status !== 200) throw new Error('Error while connecting to '+this.getBaseUri(code)+', status: '+response.status+', expected: 200');
//
//                 let addrInfo = response.data;
//
//                 result.addresses.push({
//                     address: addrInfo.address,
//                     final_balance: addrInfo.balance
//                 });
//
//                 result.txs = result.txs.concat(addrInfo.txrefs);
//             }
//
//             callback(result);
//         }));
}
