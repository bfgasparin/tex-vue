import BaseTransaction from './BaseTransaction'
import pushtx from 'blockchain.info/pushtx'
import BN from 'bignumber.js'
import _ from 'loddash'

export default class BitcoinTransaction extends BaseTransaction {
  getUnspentOutputs () {
    let result = []
    let state = this.app.getState()
    let txs = _.get(state, 'storage.txs.' + this.code)
    for (let i in txs) {
      let tx = txs[i]
      for (let j in tx.out) {
        let output = tx.out[j]
        if (!output.spent && this.wallet.hasAddress(output.addr)) {
          result.push({
            tx_hash: tx.hash,
            n: output.n,
            value: (new BN(output.value)).div(100000000).toString(), // todo: to Bitcoin, no magic numbers
            addr: output.addr
          })
        }
      }
    }
    return result
  }

  getRecommendedFee () {
    // build tx without fee for now to estimate length in bytes
    this.fee = 0
    this.prepare(true)
    this.buildAndSign()

    let bytes = this.getSizeInBytes()

    // calculate fee
    let recommendedFeePerByte = this.getRecommendedFeePerByte()
    let recommendedFee = (new BN(recommendedFeePerByte)).mul(new BN(bytes)).toString()

    // rebuild tx with fee now
    this.fee = recommendedFee
    this.prepare()
    this.buildAndSign()

    return recommendedFee
  }

  getRecommendedFeePerByte () {
    return new BN('0.00000260').toString() // todo: usual/priority/custom + query dynamically
  }

  pushtx (hex, options, callback) {
    pushtx.pushtx(hex, options).then((result) => {
      let resultBool = result.substr(0, 'Transaction Submitted'.length) === 'Transaction Submitted'
      callback(resultBool)
    })
  }
}
