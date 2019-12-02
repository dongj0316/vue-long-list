<template>
  <div ref="longList" class="long-list">
    <div ref="fragment" class="fragment" :style="{ transform: `translate3d(0, ${translateY}px, 0)` }">
      <template v-for="item in currentViewList">
        <div :key="item.key % item.key || null">
          <slot :item="item.item"></slot>
        </div>
      </template>
    </div>

    <div class="footer" :style="{ paddingTop: `${loadingTop}px` }">
      <div v-if="!finished" ref="loadGuard">
        <slot name="loading">
          <div class="footer-loading">Loading......</div>
        </slot>
      </div>
      <div v-else>
        <slot name="finished">
          <div class="footer-done">没有了......</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { getScroller, getScrollTop } from './utils'
const LOAD_EVENT = 'load'

export default {
  name: 'vue-long-list',
  props: {
    size: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      scroller: null,
      innerHeight: window.innerHeight,
      finished: false,
      loading: false,
      itemHeight: 0,
      sourceList: [],
      currentViewList: []
    }
  },
  computed: {
    loadingTop () {
      return this.sourceList.length * this.itemHeight
    },
    pageHeight () {
      return this.itemHeight * this.size
    },
    translateY () {
      const [firstItem] = this.currentViewList
      if (!firstItem) {
        return 0
      }
      return this.itemHeight * firstItem.key
    }
  },
  mounted () {
    this.$nextTick(() => {
      const scroller = this.scroller = getScroller(this.$refs.longList)

      const { innerHeight, done, pushItems } = this
      // 异步加载
      const loadGuard = this.$refs.loadGuard
      const loadCallback = () => {
        if (this.finished) {
          return
        }

        const { y } = loadGuard.getBoundingClientRect()
        if (y <= innerHeight) {
          if (this.loading) {
            return
          }

          this.loading = true
          this.$emit(LOAD_EVENT, { done, pushItems })
        }
      }

      const fragment = this.$refs.fragment
      const fragmentCallBack = (scrollTop, isDown) => {
        const { top, bottom } = fragment.getBoundingClientRect()
        if (isDown) {
          // 向下
          if (bottom <= innerHeight) {
            this.down(scrollTop, bottom)
          }
        } else {
          // 向上
          if (top >= 0) {
            this.up(scrollTop, top)
          }
        }
      }

      let oldTop = 0
      const scrollCallback = () => {
        const scrollTop = getScrollTop(scroller)

        loadCallback()
        fragmentCallBack(scrollTop, scrollTop > oldTop)

        oldTop = scrollTop
      }
      loadCallback()
      scroller.addEventListener('scroll', scrollCallback)

      this.$once('hook:beforeDestroy', () => {
        scroller.removeEventListener('scroll', scrollCallback)
      })
    })
  },
  methods: {
    done (finished) {
      if (this.finished) {
        return
      }
      if (finished === true) {
        this.finished = finished
      }
      const { size, sourceList, currentViewList } = this
      const length = currentViewList.length

      if (length === 0) {
        this.currentViewList = [...sourceList.slice(0, size)]
        this.$nextTick().then(() => {
          this.itemHeight = this.$refs.fragment.children[0].offsetHeight
          this.loading = false
        })
      } else if (length === size) {
        this.currentViewList.push(...sourceList.slice(size, size * 2))
        this.loading = false
      } else {
        // 已经触发了加载，但还没加载完成时，向上滚动了
        if (this.isLoadingView()) {
          const lastKey = currentViewList[length - 1].key
          this.currentViewList = [...currentViewList.slice(size, size * 2), ...sourceList.slice(lastKey + 1, lastKey + 1 + size)]
        }
        this.loading = false
      }
    },
    // 向下滚动
    down (scrollTop, y) {
      const { size, currentViewList } = this
      const currentLength = currentViewList.length

      if (currentLength < size) {
        return
      }

      const { sourceList } = this

      if (currentLength === size) {
        this.currentViewList.push(...sourceList.slice(size, size * 2))
        return
      }

      const length = sourceList.length
      const lastKey = currentViewList[currentLength - 1].key

      if (lastKey >= length - 1) {
        return
      }

      let startPoint
      const { pageHeight } = this

      if (y < 0) {
        // 处理快速滚动
        const page = (scrollTop - scrollTop % pageHeight) / pageHeight + (scrollTop % pageHeight === 0 ? 0 : 1) - 1
        startPoint = Math.min(page * size, length - size * 2)
      } else {
        startPoint = currentViewList[size].key
      }
      this.currentViewList = sourceList.slice(startPoint, startPoint + size * 2)
    },
    // 向上滚动
    up (scrollTop, y) {
      const { size, currentViewList } = this
      const currentLength = currentViewList.length

      if (currentLength < size) {
        return
      }

      const firstKey = currentViewList[0].key

      if (firstKey === 0) {
        return
      }

      let startPoint
      const { sourceList, innerHeight, pageHeight } = this

      if (y > innerHeight) {
        // 处理快速滚动
        const page = (scrollTop - scrollTop % pageHeight) / pageHeight + (scrollTop % pageHeight === 0 ? 0 : 1) - 1
        startPoint = Math.max(page * size, 0)
      } else {
        startPoint = currentViewList[0].key - size
      }
      this.currentViewList = sourceList.slice(startPoint, startPoint + size * 2)
    },
    pushItems (items) {
      const length = this.sourceList.length
      const normalizedItems = items.map((item, index) => {
        return {
          key: length + index,
          item
        }
      })
      this.sourceList = this.sourceList.concat(normalizedItems)
    },
    isLoadingView () {
      return this.$refs.loadGuard.getBoundingClientRect().y <= this.innerHeight
    }
  }
}
</script>

<style lang="less" scoped>
.long-list {
  position: relative;
  overflow: hidden;
  .fragment {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: 1;
    overflow: hidden;
  }
  .footer {
    position: relative;
    &-loading, &-done {
      padding: 15px;
      text-align: center;
    }
  }
}
</style>