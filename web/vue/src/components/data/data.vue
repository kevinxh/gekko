<template lang='jade'>
  .contain
    .text(v-html='intro')
    .hr
    h2 现有数据
    .txt--center.my2(v-if='datasetScanstate === "idle"')
      a.w100--s.btn--primary.scan-btn(href='#', v-on:click.prevent='scan') 扫描现有数据
    .txt--center.my2(v-if='datasetScanstate === "scanning"')
      spinner
    .my2(v-if='datasetScanstate === "scanned"')
      .bg--orange.p1.warning.my1(v-if='unscannableMakets.length')
        p.clickable(v-if='!viewUnscannable', v-on:click.prevent='toggleUnscannable') 有些数据有问题：
        template(v-if='viewUnscannable')
          p 无法找到数据：
          .mx2(v-for='market in unscannableMakets')
            | - {{ market.exchange }}:{{ market.currency }}:{{ market.asset }}
      template(v-if='datasets.length')
        table.full.data
          thead
            tr
              th 交易所
              th 货币
              th 数字货币
              th 开始
              th 结束
              th 时长
          tbody
            tr(v-for='set in datasets')
              td {{ set.exchange }}
              td {{ set.currency }}
              td {{ set.asset }}
              td {{ fmt(set.from) }}
              td {{ fmt(set.to) }}
              td {{ humanizeDuration(set.to.diff(set.from)) }}
      template(v-if='!datasets.length')
        p 没有可用数据。
    .my2
      h2 导入数据
      p.text 你可以使用这个功能轻松导入交易所以往数据
      router-link.btn--primary(to='/data/importer') 去导入
</template>

<script>

import spinner from '../global/blockSpinner.vue'
import marked from '../../tools/marked'
import dataset from '../global/mixins/dataset'
// global moment
// global humanizeDuration

let intro = marked(`

## 现有数据

此系统需要市场数据才可以进行回测测试。如果你想开始实施虚拟交易，现有数据也可以作为开始之前的基准。


`);

export default {
  mixins: [ dataset ],
  components: {
    spinner
  },
  data: () => {
    return {
      intro,
      viewUnscannable: false
    }
  },
  methods: {
    toggleUnscannable: function() { this.viewUnscannable = true },
    humanizeDuration: (n) => window.humanizeDuration(n),
    fmt: mom => mom.format('YYYY-MM-DD HH:mm'),
  }
}
</script>

<style>

.clickable {
  cursor: pointer;
}

table.full {
  width: 100%;
}

table.full td {
  padding: 0.5rem 0;
}

table.full.data th {
  text-align: left;
  padding: 0.5rem 0;
}

.warning p {
  margin: 0;
  padding: 0;
}
</style>
