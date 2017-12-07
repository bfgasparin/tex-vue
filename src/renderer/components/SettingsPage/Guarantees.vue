<template>
    <div>
        <p>These are all the guarantees from the TomorrowEx server: </p>

        <div class="guarantees-container">
            <textarea class="form-control guarantees-textarea" rows="15" :value="guarantees"/>
              <button v-clipboard:copy="guarantees">
              <icon icon="docs"></icon>Copy
            </button>
        </div>
    </div>
</template>

<script>
  import { Icon } from 'vue-photonkit'
  export default {
    data () {
      return {
        'guarantees': ''
      }
    },
    components: { Icon }
  }
</script>

<style scoped lang="scss">

.guarantees-container {
    position: 'relative';
}

.guarantees-textarea {
    background-color: 'white';
}
</style>
