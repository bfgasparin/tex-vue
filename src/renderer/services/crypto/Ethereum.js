import EthereumTransaction from './tx/EthereumTransaction'
import Notifications from '../Notifications'
import apiQuerier from './api/etherscan'
import ethUtils from 'ethereumjs-util'
import {utils, Ec} from 'elliptic'
import Storage from '../Storage'
import BN from 'bignumber.js'
import crypto from 'crypto'
import Base from './Base'
import _ from 'lodash'

export default class Ethereum extends Base {
  constructor (...args) {
    super(...args)
    this.wei = 1e18
  }

  queryMultiAddressBalancesAndTxs (addresses, callback) {
    apiQuerier.getTransactionsMultiAddress(this.code, addresses, (result) => {
      let balances = []
      for (let i in result.addresses) {
        let resultAddress = result.addresses[i]
        if (this.wallet.hasAddress(resultAddress.address)) {
          balances.push({
            address: resultAddress.address,
            balance: (new BN(resultAddress.balance)).div(this.wei).toString()
          })
        }
      }

      callback(balances, result.txs, result.txCounts)
    })
  }

  updateWallets (done) {
    let addresses = this.wallet.getAllAddresses(true)

    this.queryMultiAddressBalancesAndTxs(addresses, (balances, txs, txCounts) => {
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

      Storage.set('txCounts.' + this.code, txCounts, () => {
        this.app.reloadStorage()
      })

      if (!depositAmount.isZero()) setTimeout(() => Notifications.notifyNewDeposit(depositAmount.toFixed(8), this.code), 500)
      if (!withdrawalAmount.isZero()) setTimeout(() => Notifications.notifyNewWithdrawal(withdrawalAmount.toFixed(8), this.code), 1000)

      done()
    })
  }

  genPair () {
    let randbytes = crypto.randomBytes(32)
    let address = '0x' + ethUtils.privateToAddress(randbytes).toString('hex')
    return {
      'address': address,
      'privateKey': randbytes.toString('hex')
    }
  }

  getTxClass () { return EthereumTransaction };

  signTomorrowExMessage (message, privKey) {
    // Reference https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
    // Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]

    let hash = ethUtils.hashPersonalMessage(Buffer.from(message))

    let EC = new Ec('secp256k1')
    let key = EC.keyFromPrivate(privKey)

    let signature = key.sign(hash)
    let signatureHex = this.compactSignature(signature)

    return signatureHex
  }

  constructLength (arr, len) {
    if (len < 0x80) {
      arr.push(len)
      return
    }
    var octets = 1 + (Math.log(len) / Math.LN2 >>> 3)
    arr.push(octets | 0x80)
    while (--octets) {
      arr.push((len >>> (octets << 3)) & 0xff)
    }
    arr.push(len)
  }

  compactSignature (sig) {
    var r = sig.r.toArray()
    var s = sig.s.toArray()

    // Pad values
    while (r.length < 32) { r = [ 0 ].concat(r) }
    // Pad values
    while (s.length < 32) { s = [ 0 ].concat(s) }

    // while (!s[0] && !(s[1] & 0x80)) {
    //     s = s.slice(1);
    // }
    var arr = []
    arr = arr.concat(r)
    var backHalf = arr.concat(s)
    var res = []
    res = res.concat(backHalf)
    res = res.concat(sig.recoveryParam + 27)
    return utils.encode(res, 'hex')
  }
};
