import Bitcoin from './Bitcoin'
import Litecoin from './Litecoin'
import Ethereum from './Ethereum'

export default class Factory {
  static make (app, code) {
    switch (code) {
      case 'BTC':
        return new Bitcoin(app, code)
      case 'LTC':
        return new Litecoin(app, code)
      case 'ETH':
        return new Ethereum(app, code)
      default:
        throw new Error('No crypto factory code for currency ' + code)
    }
  }
}
