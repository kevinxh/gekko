<template lang='jade'>
  div.contain.my2
    div(v-if='data && !data.done')
      h2 正在导入...
      .grd
        .grd-row
          .grd-row-col-2-6 <strong>市场:</strong>
          .grd-row-col-4-6 {{ data.watch.exchange }}
        .grd-row
          .grd-row-col-2-6 <strong>货币/数字货币:</strong>
          .grd-row-col-4-6 {{ data.watch.currency }}/{{ data.watch.asset }}

      .grd
        .grd-row
          .grd-row-col-2-6 <strong>开始:</strong>
          .grd-row-col-4-6 {{ fmt(from) }}
        .grd-row
          .grd-row-col-2-6 <strong>结束:</strong>
          .grd-row-col-4-6 {{ fmt(to) }}
        .grd-row(v-if='initialized')
          .grd-row-col-2-6 <strong>进度:</strong>
          .grd-row-col-4-6 {{ fmt(latest) }}
        .grd-row(v-if='initialized')
          .grd-row-col-2-6 <strong>剩余:</strong>
          .grd-row-col-4-6 {{ fromEnd }}
      spinner(v-if='!initialized')
      .contain(v-if='initialized')
        progressBar(:progress='progress')
      p 
        em (你不必等待数据导入结束
          | 你已经可以进行部分回测
          router-link(to='/backtest') 回测
          | ).
    div(v-if='data && data.done').txt--center
      h2 导入结束
      p 
        | 去
        router-link(to='/backtest') 回测
        |  使用你的新数据。
    div(v-if='!data').txt--center
      h2 ERROR: Uknown import
      p 
        I don't know this import..
</template>

<script>

import _ from 'lodash';
import progressBar from '../../global/progressBar.vue'
import spinner from '../../global/blockSpinner.vue'

export default {
  components: {
    progressBar,
    spinner
  },
  computed: {
    data: function() {
      return _.find(
        this.$store.state.imports,
        { id: this.$route.params.id }
      );
    },
    initialized: function() {
      if(this.data && this.latest.isValid())
        return true
    },
    latest: function() {
      if(this.data)
        return this.mom(this.data.latest);
    },
    fromEndMs: function() {
      if(this.data)
        return this.to.diff(this.latest);
    },
    fromEnd: function() {
      if(!this.latest)
        return 'LOADING'

      return humanizeDuration(this.fromEndMs);
    },
    from: function() {
      if(this.data)
        return this.mom(this.data.from)
    },
    to: function() {
      if(this.data)
        return this.mom(this.data.to)
    },
    timespan: function() {
      if(this.data)
        return this.to.diff(this.from)
    },
    progress: function() {
      if(!this.data)
        return;

      const current = this.timespan - this.fromEndMs;
      return 100 * current / this.timespan;
    }
  },
  methods: {
    fmt: mom => { return mom.format('YYYY-MM-DD HH:mm:ss') },
    mom: str => moment.utc(str)
  }
}
</script>

<style>
</style>
