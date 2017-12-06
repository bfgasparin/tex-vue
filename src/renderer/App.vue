<template>
  <div id="app">
    <window>
      <window-content>
        <pane-group>
          <pane size="sm" :sidebar="true">
            <navigation/>
          </pane>
          <pane>
            <router-view></router-view>
          </pane>
        </pane-group>
      </window-content>
      <toolbar type="footer" :title="lastUpdateText"></toolbar>
    </window>
  </div>
</template>

<script>
  import Navigation from './components/Navigation'
  import { Window, WindowContent, PaneGroup, Pane, Toolbar } from 'vue-photonkit'

export default {
    data () {
      return {
        'lastUpdateText': 'Last Updated: 05/12/2017'
      }
    },
    components: { Window, WindowContent, PaneGroup, Pane, Navigation, Toolbar },
    name: 'tomorrow-exchange'
  }
</script>

<style lang="scss">
  @import './assets/sass/app.scss'
</style>
