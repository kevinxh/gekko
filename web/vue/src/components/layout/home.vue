<template lang='jade'>
  section.contain.grd-row
    .grd-row-col-3-6(v-html='left')
    .grd-row-col-3-6.txt--center
      p
        em Invest in your future.
</template>

<script>
import marked from '../../tools/marked';
import { basePath } from '../../tools/api';

const left = marked(`

## 币圈自动化交易系统

币圈自动化交易系统具有下列功能：

* 从各个交易所导入历史记录
* 使用各种市场趋势指标，利用自定义的算法，和历史记录，用过去的数据测试算法成功率，显示一段时间内的所有交易记录以及初始和结束的账户金额
* 实时虚拟自动交易算法买卖
* 真实服务器自动交易（内测中）

`);

export default {
  data: () => {
    return {
      left
    }
  },
  computed: {
    imageUrl: function() {
      return basePath + 'assets/gekko.jpg';
    }
  }
}
</script>

