<template lang="html">
  <div>
  <img class="logo" id="logo" src="~@/assets/logo.png" alt="electron-vue">

  <nav-group title="Activities">
    <nav-group-item :active="true"><icon icon="home"></icon>Home</nav-group-item>
    <nav-group-item><icon icon="archive"></icon>Wallets</nav-group-item>
    <nav-group-item><icon icon="chart-line"></icon>Exchange</nav-group-item>
    <nav-group-item><icon icon="tools"></icon>Settings</nav-group-item>
  </nav-group>

  <div class="version">
      v{{ version }}
  </div>

  </div>
</template>

<script>
import { NavGroup, NavGroupItem, Icon } from 'vue-photonkit'

export default {
  data () {
    return {
      version: require('vue/../../package.json').version
    }
  },
  components: { NavGroup, NavGroupItem, Icon }
}
</script>

<style scoped lang="scss">
.logo {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 10px;
}

.version {
    text-align: center;
    font-size: 10px;
    padding: 5px;

    width: 100%;
    bottom: 0;
}
</style>
