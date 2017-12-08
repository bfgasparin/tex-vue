import NotEnoughMoneyError from '../../../errors/NotEnoughMoneyError'
import WalletRepository from '../../../models/WalletRepository'
import BaseTransaction from './BaseTransaction'
import etherscan from '../api/etherscan'
import EthereumTx from 'ethereumjs-tx'
import BN from 'bignumber.js'
import _ from 'lodash'

export default class EthereumTransaction extends BaseTransaction {
  getUnspentOutputs () {
    let result = []

    let wallet = WalletRepository.getByCode(this.app, this.code)
    let addresses = wallet.getAllAddresses(true)
    for (let i in addresses) {
      let amount = wallet.getAddressBalance(addresses[i])
      if (amount > 0) {
        result.push({address: addresses[i], value: amount})
      }
    }

    return result
  }

  getInputsNeededForAmount (amount) {
    let inputs = this.getUnspentOutputs()
    let remainingAmount = new BN(amount)
    let result = []
    let feePerTx = this.getRecommendedFeePerTx()
    for (let i in inputs) {
      let input = inputs[i]
      let value = new BN(input.value)
      if (value <= feePerTx) {
        continue
      }
      let valueWithFeeSubtracted = value.sub(feePerTx)
      remainingAmount = remainingAmount.sub(valueWithFeeSubtracted)
      result.push(input)
      if (remainingAmount.isNegative()) break
    }
    if (!remainingAmount.isNegative() && !remainingAmount.isZero()) {
      throw new NotEnoughMoneyError('Not enough money in the wallet to send this amount.')
    }
    return result
  }

  getRecommendedFee () {
    // build tx without fee for now to estimate how many individual txs needed
    this.fee = 0
    this.prepare(true)
    this.buildAndSign()

    let txCount = this.builtHex.length

    // calculate fee
    let recommendedFeePerTx = this.getRecommendedFeePerTx()
    let recommendedFee = (new BN(recommendedFeePerTx)).mul(new BN(txCount)).toString()

    // rebuild tx with fee now
    this.fee = recommendedFee
    this.prepare()
    this.buildAndSign()

    return recommendedFee
  }

  getNonceForAddress (address) {
    let state = this.app.getState()
    let txCounts = _.get(state, 'storage.txCounts.' + this.code)
    for (let i in txCounts) {
      let txCount = txCounts[i]
      if (txCount.address === address) {
        return new BN(txCount.txCount).toNumber() // just in case it's still hexadecimal
      }
    }
    return 0
  }

  buildAndSign () {
    let txs = []
    this.builtHex = []
    this.built = []

    let feePerTx = this.getRecommendedFeePerTx()

    let remainingAmount = this.amount
    for (let i in this.getInputsNeededForAmount(this.amountWithFee)) {
      let input = this.inputs[i]
      let privKey = Buffer.from(this.wallet.getPrivateKeyOfAddress(input.address), 'hex')
      let addressBalance = this.wallet.getAddressBalance(input.address)
      let addressBalanceWithoutFee = (new BN(addressBalance)).sub(feePerTx).sub(0.00000001).toNumber() // minus small amount, correcting for problems with floats
      let amount = ((new BN(addressBalanceWithoutFee)).cmp(new BN(remainingAmount)) === 1) ? remainingAmount : addressBalanceWithoutFee
      remainingAmount = (new BN(remainingAmount)).sub(addressBalanceWithoutFee).toNumber()
      let txData = {
        nonce: '0x' + (new BN(this.getNonceForAddress(input.address))).toString(16),
        gasPrice: '0x' + this.getGasPriceHex(),
        gasLimit: '0x' + (new BN(this.getGasLimit())).toString(16),
        to: this.outputs[0].address,
        value: '0x' + (new BN(amount)).mul(1e18).toString(16),
        data: '0x00',
        chainId: 1 // EIP 155 chainId - mainnet: 1, ropsten: 3
      }

      txs.push(txData)
      this.built.push(txData)

      const tx = new EthereumTx(txData)
      tx.sign(privKey)
      const serializedTx = tx.serialize().toString('hex')

      this.builtHex.push(serializedTx)
    }
  }

  pushtx (hex, options, callback) {
    etherscan.pushtx(hex, options).then((response) => {
      // eslint-disable-next-line
      callback(true)
    })
  }

  getEthGasTotal () {
    let state = this.app.getState()
    return (new BN(state.storage.ethGasPrice)).mul(this.getGasLimit()).toNumber()
  }

  getGasLimit () {
    return 21004
  }

  getRecommendedFeePerTx () {
    return this.getEthGasTotal()
  }

  getGasPriceHex () {
    let state = this.app.getState()
    return (new BN(state.storage.ethGasPrice)).mul(1e18).toString(16)
  }
}
