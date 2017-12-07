<template>
    <div>
        <p>
        This is your private keys. Please back them up in case of any software error. Please don't share them with anyone.
        </p>

        <div class="key-container">
            <textarea class="form-control keys-textarea" rows="15" :value="privateKeys"/>
            <button v-clipboard:copy="privateKeys">
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
        'privateKeys': 'BTC,16dioidoqdio3iajdskjk3qejwjdadqeeowaioaldjkoiwdqjdij3kjdkwqdjaL LTC,LRXoEWtbCKCA8Jm3La77pTh7AStPZM4E8D,T73qzBBK2RGEXd4gDeS8nCsK41tJNVjZidaPCY8wbBN7A9DZf7FH'
      }
    },
    components: { Icon }
  }
</script>

<style scoped lang="scss">

.key-container {
    position: 'relative';
}

.key-textarea {
    background-color: 'white';
}
</style>
