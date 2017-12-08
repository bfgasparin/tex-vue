import NotEnoughMoneyError from '../../../errors/NotEnoughMoneyError'
import WalletRepository from '../../../models/WalletRepository'
import Storage from '../../../services/Storage'
import CryptoFactory from '../Factory'
import bitcoin from 'bitcoinjs-lib'
import BN from 'bignumber.js'

export default class BaseTransaction {
  constructor (app, code, address, amount) {
    this.app = app
    this.code = code
    this.address = address
    this.amount = amount
    this.amountWithFee = this.amount
    this.inputs = []
    this.outputs = []
    this.change = 0
    this.fee = 0

    this.satoshi = 1e8

    this.wallet = WalletRepository.getByCode(this.app, this.code)

    console.log('New tx:', this)
  }

  getInputsNeededForAmount (amount) {
    let inputs = this.getUnspentOutputs()
    let remainingAmount = new BN(amount)
    let result = []
    for (let i in inputs) {
      let input = inputs[i]
      let value = new BN(input.value)
      remainingAmount = remainingAmount.sub(value)
      result.push(input)
      if (remainingAmount.isNegative()) break
    }
    if (!remainingAmount.isNegative() && !remainingAmount.isZero()) {
      throw new NotEnoughMoneyError('Not enough money in the wallet to send this amount.')
    }
    return result
  }

  buildAndSign () {
    let network = CryptoFactory.make(this.app, this.code).getNetworkForBitcoinJsLib()
    let tx = new bitcoin.TransactionBuilder(network)

    let totalInputAmount = new BN(0)
    for (let i in this.inputs) {
      let input = this.inputs[i]
      tx.addInput(input.tx_hash, parseInt(input.n))
      totalInputAmount = totalInputAmount.add(input.value)
    }

    let totalOutputAmount = new BN(0)
    for (let i in this.outputs) {
      let output = this.outputs[i]
      tx.addOutput(output.address, (new BN(output.value)).mul(this.satoshi).toNumber())
      totalOutputAmount = totalOutputAmount.add(output.value)
    }

    // add fee
    totalOutputAmount = totalOutputAmount.add(new BN(this.fee))

    // add change
    if (totalOutputAmount.comparedTo(totalInputAmount) === 1) throw new Error('Not enough money for this transaction + fees')
    if (totalOutputAmount.comparedTo(totalInputAmount) === -1) {
      let change = totalInputAmount.sub(totalOutputAmount)
      let lastInputAddress = this.inputs[this.inputs.length - 1].addr
      tx.addOutput(lastInputAddress, change.mul(this.satoshi).toNumber())
      this.change = change.toNumber()
      // console.log('change: '+lastInputAddress+' '+change);
    }

    for (let i in this.inputs) {
      let input = this.inputs[i]
      let privKey = this.wallet.getPrivateKeyOfAddress(input.addr)
      tx.sign(parseInt(i), bitcoin.ECPair.fromWIF(privKey, network))
    }

    this.built = tx.build()
    this.builtHex = this.built.toHex()
  }

  getSizeInBytes () {
    if (!this.builtHex) throw new Error('Build the transaction first, query size in bytes afterwards.')
    return this.builtHex.length / 2
  }

  prepare (ignoreFee = false) {
    let feeBN = new BN(this.fee)
    if ((feeBN.isZero() && !ignoreFee) || feeBN.isNegative()) throw new Error('Invalid fee')

    this.amountWithFee = (new BN(this.amount)).add(new BN(this.fee)).toNumber()
    this.inputs = this.getInputsNeededForAmount(this.amountWithFee)
    this.outputs = [ { address: this.address, value: this.amount } ]
  }

  broadcast (callback) {
    let hex = this.builtHex

    let options = {} // todo
    console.log('pushing hex')
    console.log(hex)
    console.log(this.built)
    this.pushtx(hex, options, (result) => {
      if (result) {
        Storage.push('pushedTxHashes.' + this.code, hex, () => this.app.reloadStorage())
        // eslint-disable-next-line
        callback(true, null)
      } else {
        // eslint-disable-next-line
        callback(false, result)
      }
    })
  }
}
