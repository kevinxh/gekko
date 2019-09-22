<template lang='jade'>
  .contain.py2
    .text(v-html='text')
    .hr
    h3 市场观察
    .text(v-if='!watchers.length')
      p 你现在没有在观看任何市场
    table.full.clickable(v-if='watchers.length')
      thead
        tr
          th 交易所
          th 货币
          th 数字货币
          th 开始
          th 上次更新
          th 时长
      tbody
        tr.clickable(v-for='gekko in watchers', v-on:click='$router.push({path: `live-gekkos/watcher/${gekko.id}`})')
          td {{ gekko.watch.exchange }}
          td {{ gekko.watch.currency }}
          td {{ gekko.watch.asset }}
          td 
            template(v-if='gekko.firstCandle') {{ fmt(gekko.firstCandle.start) }}
          td
            template(v-if='gekko.lastCandle') {{ fmt(gekko.lastCandle.start) }}
          td
            template(v-if='gekko.firstCandle && gekko.lastCandle') {{ timespan(gekko.lastCandle.start, gekko.firstCandle.start) }}
    h3 任务
    .text(v-if='!stratrunners.length')
      p 没有正在进行的任务
    table.full(v-if='stratrunners.length')
      thead
        tr
          th 交易所
          th 货币
          th 数字货币
          th 上次更新
          th 时长
          th 策略
          th 盈利
      tbody
        tr.clickable(v-for='gekko in stratrunners', v-on:click='$router.push({path: `live-gekkos/stratrunner/${gekko.id}`})')
          td {{ gekko.watch.exchange }}
          td {{ gekko.watch.currency }}
          td {{ gekko.watch.asset }}
          td
            template(v-if='gekko.lastCandle') {{ fmt(gekko.lastCandle.start) }}
          td
            template(v-if='gekko.firstCandle && gekko.lastCandle') {{ timespan(gekko.lastCandle.start, gekko.firstCandle.start) }}
          td {{ gekko.strat.name }}
          td
            template(v-if='!gekko.report') 0
            template(v-if='gekko.report') {{ round(gekko.report.profit) }} {{ gekko.watch.currency }}
    .hr
    h2 开始一个新任务
    router-link.btn--primary(to='/live-gekkos/new') 开始一个新任务
</template>

<script>

import marked from '../../tools/marked'
// global moment
// global humanizeDuration

const text = marked(`

## 实时任务

使用你的算法来进行模拟实时市场操作！或者... 如果你有足够的信心，用这个系统连接交易所账户做实时交易！

`);

export default {
  data: () => {
    return {
      text
    }
  },
  created: function() {
    this.timer = setInterval(() => {
      this.now = moment();
    }, 1000)
  },
  destroyed: function() {
    clearTimeout(this.timer);
  },
  data: () => {
    return {
      text,
      timer: false,
      now: moment()
    }
  },
  computed: {
    stratrunners: function() {
      return this.$store.state.stratrunners
    },
    watchers: function() {
      return this.$store.state.watchers
    }
  },
  methods: {
    humanizeDuration: (n) => window.humanizeDuration(n),
    moment: mom => moment.utc(mom),
    fmt: mom => moment.utc(mom).format('YYYY-MM-DD HH:mm'),
    round: n => (+n).toFixed(3),
    timespan: function(a, b) {
      return this.humanizeDuration(this.moment(a).diff(this.moment(b)))
    }
  }
}
</script>

<style>
table.clickable {
  border-collapse: separate;
}

tr.clickable td:nth-child(1) {
  padding-left: 5px;
}

tr.clickable {
  cursor: pointer;
}
tr.clickable:hover {
  background: rgba(216,216,216,.99);
}
</style>
