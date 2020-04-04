<template>
  <div id="detail">
    <detail-nav-bar ref="nav" class="detail-nav" @titleClick="titleClick"/>
    <!-- :probe-type="3" -->
    <scroll :probe-type="3" class="content" ref="scroll" @scroll="contentScroll">
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"/>

    <detail-bottom-bar/>
  </div>
</template>

<script>
  import DetailNavBar from './childComps/DetailNavBar'
  import DetailSwiper from './childComps/DetailSwiper'
  import DetailBaseInfo from './childComps/DetailBaseInfo'
  import DetailShopInfo from './childComps/DetailShopInfo'
  import DetailGoodsInfo from './childComps/DetailGoodsInfo'
  import DetailParamInfo from './childComps/DetailParamInfo'
  import DetailCommentInfo from './childComps/DetailCommentInfo'
  import DetailBottomBar from './childComps/DetailBottomBar'

  import GoodsList from 'components/content/goods/GoodsList'

  import Scroll from 'components/common/scroll/Scroll'

  import {
    getDetail,
    getRecommend,
    Goods,
    GoodsParam,
    Shop
  } from 'network/detail'
  import {debounce} from 'common/utils'
  import {itemListenerMixin, backTopMixin} from 'common/mixin'

  export default {
    name: 'Detail',
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,

      GoodsList,

      Scroll
    },
    mixins: [itemListenerMixin, backTopMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopYs: [],

        currentIndex: 0
      }
    },
    created() {
      this.iid = this.$route.query.iid

      getDetail(this.iid).then(res => {
        // 获取轮播图
        const data = res.result
        this.topImages = data.itemInfo.topImages

        // 获取商品信息对象
        this.goods = new Goods(
          data.itemInfo,
          data.columns,
          data.shopInfo.services
        )

        // 获取商家信息对象
        this.shop = new Shop(data.shopInfo)

        // 获取详情数据
        this.detailInfo = data.detailInfo

        // 获取商品参数信息
        this.paramInfo = new GoodsParam(
          data.itemParams.info,
          data.itemParams.rule
        )

        // 获取商品评论信息
        if (data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }

        // 值不对，图片未加载完成
        // this.$nextTick(() => {
        //   this.themeTopYs = []
        //   this.themeTopYs.push(0)
        //   this.themeTopYs.push(this.$refs.params.$el.offsetTop)
        //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        // })
      })

      getRecommend().then(res => {
        this.recommends = res.data.list
      })
    },
    methods: {
      imageLoad() {
        this.$refs.scroll.refresh()

        this.themeTopYs = []
        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.params.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        this.themeTopYs.push(Number.MAX_VALUE)
      },
      titleClick(index) {
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 300)
      },
      contentScroll(position) {
        this.listenShowBackTop(position)

        // tabControl是否吸顶
        this.isTabFixed = -position.y > this.tabOffsetTop

        // 根据滚动位置切换navbar
        const positionY = -position.y

        // let newArray = this.themeTopYs.filter(n => {
        //   return n <= positionY
        // })
        // this.currentIndex = newArray.length - 1

        const length = this.themeTopYs.length
        for (let i = 0; i < length - 1; i++) {
          if (
            this.currentIndex !== i &&
            positionY >= this.themeTopYs[i] &&
            positionY < this.themeTopYs[i + 1]
          ) {
            this.currentIndex = i
            this.$refs.nav.currentIndex = this.currentIndex
          }
        }
      }
    },
    mounted() {
    },
    destroyed() {
      this.$bus.$off('itemImageLoad', this.itemImageListener)
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 1;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 1;
    background-color: #fff;
  }

  .content {
    position: relative;
    height: calc(100% - 102px);
  }
</style>
