<template>
  <div>
    <h1>Tomorrow Exchange</h1>

    <p>
      This is an early release of Tomorrow Exchange. It is a cryptocurrency wallet and distributed exchange.
      To learn more, please visit its official website TomorrowEx.com
    </p>

    <p class="alert alert-warning">
    <strong>WARNING!</strong> This is a <strong>beta</strong> version, an experimental technology in its early stage.
    Do NOT send large amounts to your addresses. Always backup your private keys each time you create a new address.
    We are responsible for the funds that are transferred to us during the exchange, but at this stage we are not
    responsible for any loss caused by this software.
    </p>
  </div>
</template>

<script>
  export default {
  }
</script>

<style lang="scss">
.alert-warning {
    color: rgb(138, 109, 59);
    background-color: rgb(252, 248, 227);
    border-color: rgb(250, 235, 204);
}
.alert {
    margin-bottom: 20px;
    padding: 15px;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-image: initial;
    border-radius: 4px;
}
</style>
