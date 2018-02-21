<template lang='jade'>
  div.contain.my2
    div.text(v-html='intro')
    .hr
    h3 正在导入的任务
    p(v-if='imports.length === 0') 你现在没有正在导入的数据
    ul(v-if='imports.length')
      li(v-for='_import in imports')
        router-link(:to='"/data/importer/import/" + _import.id') {{ _import.watch.exchange }}:{{ _import.watch.currency }}/{{ _import.watch.asset }}
        
    .hr
    h3 开始导入新数据
    import-config-builder(v-on:config='updateConfig')
    .hr
    .txt--center
      a.w100--s.my1.btn--primary(href='#', v-on:click.prevent='run') 导入
</template>

<script>

import { post } from '../../../tools/ajax'
import spinner from '../../global/blockSpinner.vue'
import importConfigBuilder from './importConfigBuilder.vue'

import marked from '../../../tools/marked'

let intro = marked(`

## 导入数据

此功能可以导入交易所历史记录。

`)

export default {
  components: {
    importConfigBuilder,
    spinner
  },
  data: () => {
    return {
      intro,
      config: {}
    }
  },
  computed: {
    imports: function() {
      return this.$store.state.imports
    }
  },
  methods: {
    daysApart: function(range) {
      let to = moment(range.to);
      let from = moment(range.from);

      return to.diff(from, 'days');
    },
    updateConfig: function(config) {
      this.config = config;
    },
    run: function() {
      let daysApart = this.daysApart(this.config.importer.daterange);

      if(daysApart < 1)
        return alert('至少需要一天的数据')

      post('import', this.config, (error, response) => {
        if(error)
          return alert(error);

        this.$store.commit('addImport', response);

        this.$router.push({
          path: `/data/importer/import/${response.id}`,
        })
      });
    }
  }
}
</script>

<style>
</style>
