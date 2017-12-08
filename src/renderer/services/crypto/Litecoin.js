// import apiQuerier from './api/blockcypher';
// import apiQuerier from './api/chainso';
// import apiQuerier from './api/blockr';
// import apiQuerier from './api/ourown';
import apiQuerier from './api/insight-litecore'
import bitcoin from 'bitcoinjs-lib'
import BN from 'bignumber.js'
import Base from './Base'
import LitecoinTransaction from './tx/LitecoinTransaction'

export default class Litecoin extends Base {
  constructor (app, code) {
    super(app, code)
    this.satoshi = 1e8
  }

  queryMultiAddressBalancesAndTxs (addresses, callback) {
    apiQuerier.getTransactionsMultiAddress(this.code, addresses, (result) => {
      let balances = []
      for (let i in result.addresses) {
        let resultAddress = result.addresses[i]
        if (this.wallet.hasAddress(resultAddress.address)) {
          balances.push({
            address: resultAddress.address,
            balance: (new BN(resultAddress.balance)).div(this.satoshi).toString()
          })
        }
      }

      callback(balances, result.txs)
    })
  }

  genPair () {
    let network = bitcoin.networks.litecoin
    let keyPair = bitcoin.ECPair.makeRandom({network})

    return {
      'address': keyPair.getAddress(),
      'privateKey': keyPair.toWIF()
    }
  }

  getNetworkForBitcoinJsLib () { return bitcoin.networks.litecoin }
  getTxClass () { return LitecoinTransaction };
};
