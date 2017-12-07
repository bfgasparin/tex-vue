<template>
  <div>
    <h1>Settings</h1>
    <private-keys/>
    <guarantees/>
  </div>
</template>

<script>
  import PrivateKeys from './SettingsPage/PrivateKeys'
  import Guarantees from './SettingsPage/Guarantees'

  export default {
    name: 'settings-page',
    components: { PrivateKeys, Guarantees }
  }
</script>
