<template lang="html">
  <div>
  <img class="logo" id="logo" src="~@/assets/logo.png" alt="electron-vue">

  <nav-group title="Activities">

    <router-link to="/" tag="span">
      <nav-group-item :active="$route.name == 'home-page'">
          <icon icon="home"></icon>Home
      </nav-group-item>
    </router-link>

    <nav-group-item><icon icon="archive"></icon>Wallets (todo)</nav-group-item>

    <nav-group-item><icon icon="chart-line"></icon>Exchange (todo)</nav-group-item>

    <router-link to="/settings" tag=span>
      <nav-group-item :active="$route.name == 'settings-page'">
          <icon icon="tools"></icon>Settings
      </nav-group-item>
    </router-link>

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
