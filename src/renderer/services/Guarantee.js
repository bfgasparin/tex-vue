import CryptoFactory from '../services/crypto/Factory'

export default class Guarantee {
  static signMessage (message, wallet, address) {
    return wallet.signTomorrowExMessage(message, address).toString('hex')
  }

  static validateMessage (app, messageGenerated, messageFromClient, signature, signatureAddress, signatureCode = 'BTC') {
    let crypto = CryptoFactory.make(app, signatureCode)
    let result = crypto.validateTomorrowExSignature(messageGenerated, messageFromClient, signature, signatureAddress)
    return (result === true)
  }

  // ---

  static msgPlaceOrder (pair, mode, amount, price, inputAddress, codeMain, receivingAddress, codeReceiving, timestamp) {
    let msg = 'I, owner of ' + inputAddress + ' on ' + codeMain + ' and ' + receivingAddress + ' on ' + codeReceiving + ', want to place ' + mode + ' order on pair ' + pair + ' with amount ' + amount + ' and price ' + price + '. Timestamp: ' + timestamp
    return msg
  }

  static msgOrderAccepted (signingAddress, whereToSend, amountToSend, mode, amount, price, inputAddress, codeMain, receivingAddress, receivingCode, timestamp) {
    let codeSigning = 'BTC'
    let msg = 'I, Tomorrow Exchange server with address ' + signingAddress + ' on ' + codeSigning + ', guarantee the owner of '
    msg += inputAddress + ' on ' + codeMain + ' that if I will receive ' + amountToSend + ' ' + codeMain + ' to ' + whereToSend + ', '
    msg += 'I will either process the order to ' + mode + ' ' + amount + ' for price ' + price + " or better, minus miners' fee, completely or partially, "
    msg += 'with the result sent to ' + receivingAddress + ' on ' + receivingCode + ", or cancel the deposit on the owner's request. Timestamp: " + timestamp
    return msg
  }

  static msgCancelOrder (pair, mode, amount, price, inputAddress, codeMain, receivingAddress, codeReceiving, timestamp) {
    let msg = 'I, owner of ' + inputAddress + ' on ' + codeMain + ' and ' + receivingAddress + ' on ' + codeReceiving + ', want to cancel active ' + mode + ' order on pair ' + pair + ' with original amount ' + amount + ' and price ' + price + '. Timestamp: ' + timestamp
    return msg
  }

  static timestampNow () {
    return (new Date().getTime()) / 1000 | 0
  }
}
