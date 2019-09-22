<template lang='jade'>
div.contain

  .grd-row.summary
    .grd-row-col-3-6
      table.p1
        tr
          th 开始时间
          td {{ report.startTime }}
        tr
          th 结束时间
          td {{ report.endTime }}
        tr
          th 时长
          td {{ report.timespan }}
        tr
          th 开始价格
          td {{ round(report.startPrice) }} {{ report.currency }}
        tr
          th 结束价格
          td {{ round(report.endPrice) }} {{ report.currency }}
        tr
          th 市场
          td {{ round(report.market) }}%

    paperTradeSummary(:report='report')

</template>

<script>

import paperTradeSummary from '../../global/paperTradeSummary.vue'

export default {
  props: ['report'],
  components: {
    paperTradeSummary
  },
  methods: {
    round: n => (+n).toFixed(5)
  },
  computed: {
    profitClass: function() {
      if(this.report.relativeProfit > 0)
        return 'profit'
      else
        return 'loss'
    }
  }
}
</script>

<style>
.summary td {
  text-align: right;
}

</style>
