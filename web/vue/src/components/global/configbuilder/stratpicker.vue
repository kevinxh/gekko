<template lang='jade'>
.grd
  .grd-row
    .grd-row-col-3-6.px1
      h3 策略
      div
        label(for='strat').wrapper 策略:
        .custom-select.button
          select(v-model='strategy')
            option(v-for='strat in strategies') {{ strat.name }}
      div
        label(for='candleSize') K线candle size
        .grd-row
          .grd-row-col-3-6
            input(v-model='rawCandleSize')
          .grd-row-col-3-6.align
            .custom-select.button
              select(v-model='candleSizeUnit')
                option minutes
                option hours
                option days
      div
        label(for='historySize') 热身时间 (in {{ rawCandleSize }} {{ singularCandleSizeUnit }} candles):
        input(v-model='historySize')
        em.label-like (会使用开始的 {{ humanizeDuration(candleSize * historySize * 1000 * 60) }} 的数据作为历史参考)
    .grd-row-col-2-6.px1
      div
        h3 参数
        p {{ strategy }} 参数:
        textarea.params(v-model='rawStratParams')
        p.bg--red.p1(v-if='rawStratParamsError') {{ rawStratParamsError.message }}
</template>

<script>

import _ from 'lodash'
import { get } from '../../../tools/ajax'

export default {
  data: () => {
    return {
      strategies: [],

      candleSizeUnit: 'minutes',
      rawCandleSize: 15,

      strategy: 'RSI',
      historySize: 100,

      rawStratParams: '',
      rawStratParamsError: false,

      emptyStrat: false,
      stratParams: {}
    };
  },
  created: function () {
    get('strategies', (err, data) => {
        this.strategies = data;

        _.each(this.strategies, function(s) {
          s.empty = s.params === '';
        });

        this.rawStratParams = _.find(this.strategies, { name: this.strategy }).params;
        this.emptyStrat = _.find(this.strategies, { name: this.strategy }).empty;
        this.emitConfig();
    });
  },
  watch: {
    strategy: function(strat) {
      strat = _.find(this.strategies, { name: strat });
      this.rawStratParams = strat.params;
      this.emptyStrat = strat.empty;

      this.emitConfig();
    },
    candleSize: function() { this.emitConfig() },
    historySize: function() { this.emitConfig() },
    rawStratParams: function() { this.emitConfig() }
  },
  computed: {
    candleSize: function() {
       if(this.candleSizeUnit === 'minutes')
        return this.rawCandleSize;
      else if(this.candleSizeUnit === 'hours')
        return this.rawCandleSize * 60;
      else if(this.candleSizeUnit === 'days')
        return this.rawCandleSize * 60 * 24;
    },
    singularCandleSizeUnit: function() {
      // hours -> hour
      return this.candleSizeUnit.slice(0, -1);
    },
    config: function() {
      let config = {
        tradingAdvisor: {
          enabled: true,
          method: this.strategy,
          candleSize: +this.candleSize,
          historySize: +this.historySize
        }
      }

      if(this.emptyStrat)
        config[this.strategy] = {__empty: true}
      else
        config[this.strategy] = this.stratParams;

      return config;
    }
  },
  methods: {
    humanizeDuration: (n) => window.humanizeDuration(n),
    emitConfig: function() {
      this.parseParams();
      this.$emit('stratConfig', this.config);
    },
    parseParams: function() {
      try {
        this.stratParams = toml.parse(this.rawStratParams);
        this.rawStratParamsError = false;
      } catch(e) {
        this.rawStratParamsError = e;
        this.stratParams = {};
      }
    }
  }
}
</script>
<style>
.align .custom-select select {
  padding: 0.4em 1.2em .3em .8em;
}

.label-like {
  display: block;
  font-size: 0.9em;
  color: #777;
}

.align {
  padding-left: 1em;
}
</style>
