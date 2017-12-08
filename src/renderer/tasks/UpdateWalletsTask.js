import WalletRepository from '../models/WalletRepository'
import CryptoFactory from '../services/crypto/Factory'
import BaseTask from './BaseTask'

export default class UpdateWalletsTask extends BaseTask {
  run () {
    let wallets = WalletRepository.getAll(this.app)

    for (let i in wallets) {
      let wallet = wallets[i]

      this.incrementTaskCounter()

      CryptoFactory
        .make(this.app, wallet.code)
        .updateWallets(this.decrementTaskCounter.bind(this))
    }
  }
}
