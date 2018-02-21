<template lang='jade'>
div
  h3 选择时间
  template(v-if='tab === "scan"')
    .txt--center(v-if='!scanned')
      a.w100--s.btn--primary.scan-btn(href='#', v-on:click.prevent='scan') 扫描可用历史数据
    .txt--center(v-if='scanned == "fetching"')
      p.scan-btn 扫描中..
    template(v-if='scanned == true')
      template(v-if='ranges.length === 0')
        p
          strong 无法找到可用数据
            | "{{ config.watch.exchange }}:{{ config.watch.currency }}/{{ config.watch.asset }}"?
      template(v-else)
        label(for='exchange').wrapper 模拟:
        form.radio.grd
          div.grd-row(v-for='(range, i) in ranges').m1
            input.grd-row-col-1-6(type='radio', :value='i', v-model='selectedRangeIndex')
            label.grd-row-col-5-6(:for='i') {{ printRange(range) }}
      p
        em
          a(href='#', v-on:click.prevent='scan') 重新扫描
    p.txt--center
      em
        a(href='#', v-on:click.prevent='tab = "manual"') 手动选择时间range
  template(v-if='tab === "manual"')
    div
      label(for='from') 开始时间:
      input(v-model='from')
    div
      label(for='to') 结束时间:
      input(v-model='to')
    p.txt--center
    em
      a(href='#', v-on:click.prevent='tab = "scan"') 扫描时间
</template>

<script>

import _ from 'lodash'
import { post } from '../../../tools/ajax'
// global moment

export default {
  props: ['config'],
  data: () => {
    return {
      scanned: false, // 'fetching', true
      ranges: [],
      selectedRangeIndex: -1,
      tab: 'scan',

      from: '',
      to: ''
    }
  },
  methods: {
    scan: function() {
      this.scanned = 'fetching';
      this.selectedRangeIndex = -1;

      post('scan', this.config, (err, response) => {
        this.scanned = true;
        this.ranges = response;
        this.selectedRangeIndex = 0;
      });
    },
    printRange: function(range) {
      let fmt = mom => mom.format('YYYY-MM-DD HH:mm')
      let from = moment.unix(range.from);
      let to = moment.unix(range.to);
      let diff = moment.duration(to.diff(from)).humanize();
      return `${fmt(from)} to ${fmt(to)} (${diff})`;
    },
    fmtTs: (mom) => moment.unix(mom).utc(),
    fmt: (mom) => mom.utc().format(),
    emitRange: function(range) {
      this.$emit('range', {
        from: this.fmtTs(range.from),
        to: this.fmtTs(range.to)
      });
    },
    emitManualEntry: function() {
      if(this.from.length < '4' || this.from.length < '4')
        // this cannot possibly be a valid date
        return this.$emit('range', {})

      let from = moment.utc(this.from);
      let to = moment.utc(this.to);

      if(from.isValid() && to.isValid()) {
        this.$emit('range', {
          from: this.fmt(from),
          to: this.fmt(to)
        })
      } else {
        this.$emit('range', {});
      }
    },
    reset: function() {
      this.scanned = false;
      this.$emit('range', {})
    }
  },
  watch: {
    from: function() {
      this.emitManualEntry();
    },
    to: function() {
      this.emitManualEntry();
    },
    config: function() {
      this.reset();
    },
    tab: function() {
      this.reset();
    },
    selectedRangeIndex: function() {
      let selectedRange = this.ranges[this.selectedRangeIndex];
      if(selectedRange)
        this.emitRange(selectedRange);
    }
  }
}
</script>

<style>

.scan-btn {
  margin-top: 80px;
  margin-bottom: 30px;
}

.radio label {
  margin-top: 0;
}

</style>
