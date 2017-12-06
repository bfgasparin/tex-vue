<template>
<div class="padded">
    <system-information/>
</div>
</template>

<script>
  import SystemInformation from './HomePage/SystemInformation'

  export default {
    name: 'home-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>
