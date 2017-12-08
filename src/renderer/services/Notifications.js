import path from 'path'

export default class Notifications {
  static notifyNewDeposit (amount, code) {
    this.notify('You have a new deposit: ' + amount + ' ' + code, 'here-i-am')
  }
  static notifyNewWithdrawal (amount, code) {
    this.notify('You have sent ' + amount + ' ' + code, 'droplet')
  }

  static getTitle () {
    return 'Tomorrow Exchange'
  }

  static notify (message, sound) {
    // code copied from legacy. Variable was never used. Why?
    // let myNotification = new Notification(this.getTitle(), {
    //   body: message,
    //   silent: true
    // })

    let soundFileName = path.join(__dirname, 'sounds/' + sound + '.mp3')
    let audio = new Audio(soundFileName)
    audio.volume = 0.50
    audio.play()
  }
}
