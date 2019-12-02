<template>
  <div class="home">
    <!-- 辅助 -->
    <div class="tips">
      <div>每页条数：{{size}}</div>
      <div>总条数：{{total}}</div>
      <div>
        <button @click="visible = true" class="button">点此修改设置</button>
      </div>
    </div>
    <div class="dialog" v-if="visible">
      <div>每页条数：</div>
      <div>
        <input class="input" v-model="sizeEdit" type="number">
      </div>

      <div>总条数：</div>
      <div>
        <input class="input" v-model="totalEdit" type="number">
      </div>
      <div>
        <button class="button" @click="updateConfigs">确定</button>
        <button class="button" @click="visible = false">关闭</button>
      </div>
    </div>

    <!-- 长列表 -->
    <VueLongList @load="onLoading">
      <template #default="{ item }">
        <div class="item">{{item.text}}</div>
      </template>
    </VueLongList>
  </div>
</template>

<script>
const SIZE = 'dlskjfwehgwjelgn'
const TOTAL = '3sdlkjfwioeug'

export default {
  name: 'home',
  data () {
    const size = sessionStorage.getItem(SIZE) || 1000
    const total = sessionStorage.getItem(TOTAL) || 100000

    sessionStorage.setItem(SIZE, size)
    sessionStorage.setItem(TOTAL, total)
    return {
      visible: false,
      page: 1,
      sizeEdit: size,
      totalEdit: total,
      size,
      total
    }
  },
  methods: {
    updateConfigs () {
      const { sizeEdit, totalEdit } = this
      sessionStorage.setItem(SIZE, sizeEdit)
      sessionStorage.setItem(TOTAL, totalEdit)
      window.location.reload()
    },
    onLoading ({ done, pushItems }) {
      setTimeout(() => {
        const { page, size, total } = this
        const maxSize = Math.min(size, total)
        const maxPage = ~~(total / maxSize) + (total % maxSize === 0 ? 0 : 1)
        const length = page === maxPage ?  total % maxSize || maxSize : maxSize
        const list = Array.from({ length }).map((_, i) => ({ text: i + (page - 1) * maxSize }))

        pushItems(list)

        done(page === maxPage)
        this.page++
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
@z-index: 2;

.home {
  position: relative;
  
  .tips {
    padding: 20px;
    position: fixed;
    top: 0;
    left: 0;
    background: transparent;
    z-index: @z-index;
  }

  .button {
    margin: 20px;
    margin-left: 0;
    padding: 8px 15px;
    color: #fff;
    background: red;
  }
  .input {
    padding: 8px 15px;
  }

  .dialog {
    box-sizing: border-box;
    position: fixed;
    padding: 20px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: @z-index + 1;
    background: rgb(78, 203, 145);
  }

  .item {
    text-align: center;
    padding: 50px 0;
    border: 1px solid #000;
    background: rgba(90, 197, 247, 0.577);
  }
}
</style>
