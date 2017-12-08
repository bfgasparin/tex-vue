import etherscan from '../services/crypto/api/etherscan'
import Storage from '../services/Storage'
import BaseTask from './BaseTask'

export default class EthereumGasPriceUpdateTask extends BaseTask {
  run () {
    this.incrementTaskCounter()

    etherscan.getGasPriceInEthFromAPI((gasPriceInEth) => {
      Storage.set('ethGasPrice', gasPriceInEth, () => {
        this.app.reloadStorage()
      })

      this.decrementTaskCounter()
    })
  }
}
