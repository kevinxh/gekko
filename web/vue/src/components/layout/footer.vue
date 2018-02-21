<template lang='jade'>
  footer.p2.bg--off-white
    .contain
      p
        em 内测阶段
      p Copyright 2018 Kevin He.
</template>

<script>
const gekkoPackage = require('../../../../../package.json');
const uiPackage = require('../../../package.json');

export default {
  data: () => {
    return {
      version: {
        gekko: gekkoPackage.version,
        ui: uiPackage.version
      }
    }
  }
}
</script>
