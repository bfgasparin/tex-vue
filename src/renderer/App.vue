<template>
  <div id="app">
    <window>
      <window-content>
        <pane-group>
          <pane size="sm" :sidebar="true">
            <navigation/>
          </pane>
          <pane>
            <div class="padded">
              <router-view></router-view>
            </div>
          </pane>
        </pane-group>
      </window-content>
      <toolbar type="footer" :title="lastUpdateText"></toolbar>
    </window>
  </div>
</template>

<script>
  import Navigation from './components/Navigation'
  import Storage from './services/Storage'
  import { Window, WindowContent, PaneGroup, Pane, Toolbar } from 'vue-photonkit'

export default {
    name: 'tomorrow-exchange',

    data () {
      return {
        'lastUpdateText': 'Last Updated: 05/12/2017'
      }
    },

    mounted () {
      Storage.set('test', '3', () => { console.log('stored') })
      console.log(Storage.getFullStorage())
      this.$store.commit('LOAD_STORAGE', Storage.getFullStorage())

      setInterval(() => {
        console.log('interval')
        this.$electron.ipcRenderer.send('ping')
      }, 1000)

      this.$electron.ipcRenderer.on('pong', (event, data) => {
        this.myDataVar = data
        console.log('test')
        console.log(data)
      })
    },

    methods: {
    },

    components: { Window, WindowContent, PaneGroup, Pane, Navigation, Toolbar }
  }
</script>

<style lang="scss">
  @import './assets/sass/app.scss'
</style>
