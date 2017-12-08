import InsightLitecore from '../api/insight-litecore'
import BaseTransaction from './BaseTransaction'
import BN from 'bignumber.js'
import _ from 'lodash'

export default class LitecoinTransaction extends BaseTransaction {
  getUnspentOutputs () {
    let result = []
    let state = this.app.getState()
    let txs = _.get(state, 'storage.txs.' + this.code)

    // Warning: this version of code makes certain assumptions about the transaction and therefore cannot be viewed as fully universal/stable.
    // It will be replaced in the newer versions.

    for (let i in txs) {
      let tx = txs[i]
      for (let j in tx.vout) {
        let output = tx.vout[j]
        if (output.spentTxId === null &&
                    output.scriptPubKey.type === 'pubkeyhash' &&
                    this.wallet.hasAddress(output.scriptPubKey.addresses[0]) &&
                    output.scriptPubKey.addresses.length === 1) {
          result.push({
            tx_hash: tx.txid,
            n: parseInt(j),
            value: (new BN(output.value))/* .div(100000000) */.toNumber(), // todo: no magic numbers, see BitcoinTransaction at this exact place
            addr: output.scriptPubKey.addresses[0]
          })
        }
      }
    }

    return result
  }

  getRecommendedFee () {
    return '0.001'
  }

  pushtx (hex, options, callback) {
    InsightLitecore.pushtx(hex, options).then((response) => {
      // eslint-disable-next-line
      callback('txid' in response)
    })
  }
}
