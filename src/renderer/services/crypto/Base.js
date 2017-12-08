// import EC from 'elliptic';
import WalletRepository from '../../models/WalletRepository'
import Notifications from '../../services/Notifications'
import bitcoinMessage from 'bitcoinjs-message'
import Currency from '../../models/Currency'
import Storage from '../../services/Storage'
import bitcoin from 'bitcoinjs-lib'
import BN from 'bignumber.js'
import _ from 'lodash'

export default class Base {
  constructor (app, code) {
    this.app = app
    this.code = code
    this.currency = new Currency(app, code)
    this.wallet = WalletRepository.getByCode(app, code)
  }

  updateWallets (done) {
    let addresses = this.wallet.getAllAddresses(true)

    this.queryMultiAddressBalancesAndTxs(addresses, (balances, txs) => {
      let depositAmount = new BN(0)
      let withdrawalAmount = new BN(0)

      for (let i in balances) {
        let balanceItem = balances[i]
        if (this.wallet.hasAddress(balanceItem.address)) {
          // show notification on deposit
          let state = this.app.getState()

          let oldBalance = new BN(_.get(state, 'storage.balances.' + this.code + '.addresses.' + balanceItem.address) || 0)
          let newBalance = new BN(balanceItem.balance)
          let diff = newBalance.sub(oldBalance)
          if (diff.isNegative()) {
            withdrawalAmount = withdrawalAmount.add(diff.mul(-1))
          } else if (!diff.isZero()) {
            depositAmount = depositAmount.add(diff)
          }

          Storage.set('balances.' + this.code + '.addresses.' + balanceItem.address, balanceItem.balance, () => {
            this.app.reloadStorage()
          })
        }
      }

      Storage.set('txs.' + this.code, txs, () => {
        this.app.reloadStorage()
      })

      if (!depositAmount.isZero()) setTimeout(() => Notifications.notifyNewDeposit(depositAmount.toFixed(8), this.code), 500)
      if (!withdrawalAmount.isZero()) setTimeout(() => Notifications.notifyNewWithdrawal(withdrawalAmount.toFixed(8), this.code), 1000)

      done()
    })
  }

  genPair () {
    let network = this.getNetworkForBitcoinJsLib()
    let keyPair = bitcoin.ECPair.makeRandom({network})

    return {
      'address': keyPair.getAddress(),
      'privateKey': keyPair.toWIF()
    }
  }

  makeTransaction (...args) {
    let TxClass = this.getTxClass()
    return new TxClass(this.app, this.code, ...args)
  }

  signTomorrowExMessage (message, privKey) {
    let network = this.getNetworkForBitcoinJsLib()
    let keyPair = bitcoin.ECPair.fromWIF(privKey, network)
    let privateKey = keyPair.d.toBuffer(32)
    let messagePrefix = network.messagePrefix
    let signature = bitcoinMessage.sign(message, messagePrefix, privateKey, keyPair.compressed)
    return signature
  }

  validateTomorrowExSignature (messageGenerated, messageFromClient, signature, signatureAddress) {
    if (messageGenerated !== messageFromClient) throw new Error('Guarantee messages don\'t match. Invalid message from server.')

    let result = bitcoinMessage.verify(messageGenerated, bitcoin.networks.bitcoin.messagePrefix, signatureAddress, signature)

    return (result === true)
  }
}
