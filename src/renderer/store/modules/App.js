import Storage from './../../services/Storage'

// for now, we are using a single app vuex module with all states, getters, mutations and actions of the application
// later we can split into diferent modules

// initial state of the application
const state = {
  currencies: [
    {code: 'BTC', name: 'Bitcoin', qrPrefix: 'bitcoin:', explorerUrlAddressPrefix: 'https://blockchain.info/address/'},
    {code: 'LTC', name: 'Litecoin', qrPrefix: 'litecoin:', explorerUrlAddressPrefix: 'https://insight.litecore.io/address/'},
    {code: 'ETH', name: 'Ethereum', qrPrefix: 'ethereum:', explorerUrlAddressPrefix: 'https://etherscan.io/address/'}
  ],
  wallets: [
    {code: 'BTC'},
    {code: 'LTC'},
    {code: 'ETH'},
    {code: 'DSD'},
    {code: 'RKC'}
  ],
  exchangePairs: [
    {from: 'LTC', to: 'BTC'},
    {from: 'ETH', to: 'BTC'},
    {from: 'ETH', to: 'LTC'}
  ],
  storage: [

  ]
}

const mutations = {
  /**
   * Mudate the storage state with the given data
   */
  LOAD_STORAGE (state, data) {
    state.storage = data
  },
  LOAD_STORAGE_2 (state) {
    state.storage = Storage.getFullStorage()
  },
  /**
   * Mudate the storage state with the given data
   */
  REMOVE_WALLET (state, codeToRemove) {
    state.wallets.shift()
  }
}

const actions = {
}

const getters = {
  /**
   * Return all wallets configured in the system
   */
  allWallets (state) {
    return state.wallets
  },

  /**
   * Return all wallets configured in the system
   */
  storagePath (state) {
    return Storage.getDefaultDataPath()
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
