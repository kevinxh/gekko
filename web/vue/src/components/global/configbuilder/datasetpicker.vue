<template lang='jade'>
div
  h3 选择数据
  .txt--center.my2(v-if='datasetScanstate === "idle"')
    a.w100--s.btn--primary.scan-btn(href='#', v-on:click.prevent='scan') 扫描可用历史数据
  .txt--center.my2(v-if='datasetScanstate === "scanning"')
    spinner
  .my2(v-if='datasetScanstate === "scanned"')

    div(v-if='datasets.length != 0')
      table.full
        thead
          tr
            th 
            th 交易所
            th 货币
            th 数字货币
            th 开始时间
            th 结束时间
            th 时长
        tbody
          tr(v-for='(set, i) in datasets')
            td.radio
              input(type='radio', name='dataset', :value='i', v-model='setIndex', v-bind:id='set.id')
            td 
              label(v-bind:for='set.id') {{ set.exchange }}
            td 
              label(v-bind:for='set.id') {{ set.currency }}
            td
              label(v-bind:for='set.id') {{ set.asset }}
            td 
              label(v-bind:for='set.id') {{ fmt(set.from) }}
            td 
              label(v-bind:for='set.id') {{ fmt(set.to) }}
            td
              label(v-bind:for='set.id') {{ humanizeDuration(set.to.diff(set.from)) }}
      a.btn--primary(href='#', v-on:click.prevent='openRange', v-if='!rangeVisible') 调整时间
      template(v-if='rangeVisible')
        div
          label(for='customFrom') 开始时间:
          input(v-model='customFrom')
        div
          label(for='customTo') 结束时间:
          input(v-model='customTo')

    em(v-else) 没有找到数据
      a(href='#/data/importer') 导入

</template>

<script>

import _ from 'lodash'
import Vue from 'vue'

import { post } from '../../../tools/ajax'
import spinner from '../../global/blockSpinner.vue'
import dataset from '../../global/mixins/dataset'

export default {
  components: {
    spinner
  },
  data: () => {
    return {
      setIndex: -1,
      customTo: false,
      customFrom: false,
      rangeVisible: false,
      set: false
    };
  },
  mixins: [ dataset ],
  methods: {
    humanizeDuration: (n) => {
      return window.humanizeDuration(n, {largest: 4});
    },
    fmt: mom => mom.utc().format('YYYY-MM-DD HH:mm'),
    openRange: function() {
      if(this.setIndex === -1)
        return alert('Select a dataset to adjust range');

      this.updateCustomRange();

      this.rangeVisible = true;
    },
    updateCustomRange: function() {
      this.customTo = this.fmt(this.set.to);
      this.customFrom = this.fmt(this.set.from);
    },
    emitSet: function(val) {
      if(!val)
        return;

      let set;

      if(!this.customTo)
        set = val;
      else {
        set = Vue.util.extend({}, val);
        set.to = moment.utc(this.customTo, 'YYYY-MM-DD HH:mm').format();
        set.from = moment.utc(this.customFrom, 'YYYY-MM-DD HH:mm').format();
      }

      this.$emit('dataset', set);
    }
  },
  watch: {

    setIndex: function() {
      this.set = this.datasets[this.setIndex];

      this.updateCustomRange();

      this.emitSet(this.set);
    },

    customTo: function() { this.emitSet(this.set); },
    customFrom: function() { this.emitSet(this.set); }
  }
}
</script>
<style>
td.radio {
  width: 45px;
}
td label{
  display: inline;
  font-size: 1em;
}
</style>