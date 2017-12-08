const storage = require('electron-json-storage')
const _ = require('lodash')

export default class Storage {
    static modifying = false;
    static storageFileName = 'storage_test8'; // 2, 7

    static get (key, callback) {
      storage.get(this.storageFileName, (error, data) => {
        if (error) throw error

        if (callback) callback(_.get(data, key))
      })
    }

    static set (key, value, callback) {
      if (this.modifying) {
        setTimeout(() => {
          this.set(key, value, callback)
        }, 50)
        return
      }
      this.modifying = true

      storage.get(this.storageFileName, (error, data) => {
        if (error) throw error

        data = _.set(data, key, value)

        storage.set(this.storageFileName, data, (error) => {
          if (error) throw error

          this.modifying = false

          if (callback) callback()
        })
      })
    }

    static push (key, value, callback) {
      if (this.modifying) {
        setTimeout(() => {
          this.push(key, value, callback)
        }, 50)
        return
      }
      this.modifying = true

      storage.get(this.storageFileName, (error, data) => {
        if (error) throw error

        let dataAtPath = _.get(data, key)

        if (typeof dataAtPath === 'undefined' || dataAtPath === null) {
          dataAtPath = []
        }

        dataAtPath.push(value)

        data = _.set(data, key, dataAtPath)

        storage.set(this.storageFileName, data, (error) => {
          if (error) throw error

          this.modifying = false

          if (callback) callback()
        })
      })
    }

    /**
     * Load storage data from the filesystem
     */
    static getFullStorage (callback = null) {
      storage.get(this.storageFileName, (error, data) => {
        if (error) throw error

        if (callback) callback(data)
      })
    }

    /**
     * Load storage data from the filesystem
     */
    static getDefaultDataPath () {
      return storage.getDefaultDataPath()
    }
};
