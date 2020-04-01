<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
    <tab-control :titles="['流行', '新款', '精选']" 
                 @tabClick="tabClick" 
                 ref="tabControl1"
                 class="tab-control"
                 v-show="isTabFixed"/>
    
    <scroll class="content" 
            ref="scroll" 
            :probe-type="3" 
            :pull-up-load="true"
            @scroll="contentScroll"
            @pullingUp="loadMore">

      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
      <recommend-view :recommends="recommends"/>
      <feature-view></feature-view>
      <tab-control :titles="['流行', '新款', '精选']" 
                   @tabClick="tabClick" 
                   ref="tabControl2"/>
      <goods-list :goods="showGoods"/>
    </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>
  import HomeSwiper from './childComps/HomeSwiper'
  import RecommendView from './childComps/RecommendView'
  import FeatureView from './childComps/FeatureView'

  import NavBar from 'components/common/navbar/NavBar'
  import Scroll from 'components/common/scroll/Scroll'
  import BackTop from 'components/common/backTop/BackTop'

  import TabControl from 'components/content/tabControl/TabControl'
  import GoodsList from 'components/content/goods/GoodsList'

  import { getHomeMultidata, getHomeGoods } from 'network/home'
  import { debounce } from 'common/utils'

  export default {
    name: 'Home',
    components: {
      HomeSwiper,
      RecommendView,
      FeatureView,

      NavBar,
      Scroll,
      BackTop,

      TabControl,
      GoodsList
    },
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          pop: { page: 0, list: [] },
          new: { page: 0, list: [] },
          sell: { page: 0, list: [] }
        },
        currentType: 'pop',
        isShowBackTop: false,
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY: 0
      }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list
      }
    },
    activated() {
      this.$refs.scroll.refresh()
      this.$refs.scroll.scrollTo(0, this.saveY, 0)
    },
    deactivated() {
      this.saveY = this.$refs.scroll.getScrollY()
    },
    created() {
      this.getHomeMultidata()

      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')
    },
    mounted() {
      // 防抖函数，减少执行次数
      const refresh = debounce(this.$refs.scroll.refresh, 200)
      // 监听item中图片是否加载完成， 解决下拉不动的bug
      this.$bus.$on('itemImageLoad', () => {
        refresh()
      })
    },
    methods: {
      /*
              事件监听相关
          */
      tabClick(key) {
        switch (key) {
          case 0:
            this.currentType = 'pop'
            break

          case 1:
            this.currentType = 'new'
            break

          case 2:
            this.currentType = 'sell'
            break
        }
        this.$refs.tabControl1.currentKey = key
        this.$refs.tabControl2.currentKey = key
      },
      backClick() {
        this.$refs.scroll.scrollTo(0, 0)
      },
      contentScroll(position) {
        this.isShowBackTop = (-position.y) > 1000

        // tabControl是否吸顶
        this.isTabFixed = (-position.y) > this.tabOffsetTop
      },
      loadMore() {
        this.getHomeGoods(this.currentType)
      },
      swiperImageLoad() {
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop // 监听图片加载后再获取offsetTop
      },

      //网络请求相关
      getHomeMultidata() {
        getHomeMultidata().then(res => {
          this.banners = res.data.banner.list
          this.recommends = res.data.recommend.list
        })
      },
      getHomeGoods(type) {
        const page = this.goods[type].page + 1
        getHomeGoods(type, page).then(res => {
          this.goods[type].list.push(...res.data.list)
          this.goods[type].page += 1

          // 完成下拉加载更多
          this.$refs.scroll.finishPullUp()
        })
      }
    }
  }
</script>

<style scoped>
  .home-nav {
    background-color: var(--color-tint);
    color: white;
  }

  #home {
    height: 100vh;
    position: relative;
  }

  .content {
    overflow: hidden;

    position: absolute;
    top: 44px;
    bottom: 49px;
  }

  .tab-control {
    position: relative;
    z-index: 1;
  }
</style>