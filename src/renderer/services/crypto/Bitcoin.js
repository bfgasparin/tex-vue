import BitcoinTransaction from './tx/BitcoinTransaction'
import blockexplorer from 'blockchain.info/blockexplorer'
import bitcoin from 'bitcoinjs-lib'
import BN from 'bignumber.js'
import Base from './Base'

export default class Bitcoin extends Base {
  constructor (app, code) {
    super(app, code)
    this.satoshi = 1e8
  }

  queryMultiAddressBalancesAndTxs (addresses, callback) {
    blockexplorer.getMultiAddress(addresses).then((result) => {
      let balances = []
      for (let i in result.addresses) {
        let resultAddress = result.addresses[i]
        if (this.wallet.hasAddress(resultAddress.address)) {
          balances.push({
            address: resultAddress.address,
            balance: (new BN(resultAddress.final_balance)).div(this.satoshi).toString()
          })
        }
      }

      callback(balances, result.txs)
    })
  }

  getNetworkForBitcoinJsLib () { return bitcoin.networks.bitcoin }
  getTxClass () { return BitcoinTransaction };
};
