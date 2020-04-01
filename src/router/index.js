import Vue from 'vue'
import VueRouter from 'vue-router'

const Home = () => import('views/home/Home')
const Category = () => import('views/category/Category.vue')
const Shopcart = () => import('views/shopcart/Shopcart.vue')
const Profile = () => import('views/profile/Profile.vue')
const Detail = () => import('views/detail/Detail.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/home'
  }, {
    path: '/home',
    component: Home
  }, {
    path: '/category',
    component: Category
  }, {
    path: '/shopcart',
    component: Shopcart
  }, {
    path: '/profile',
    component: Profile
  },{
    path: '/detail',
    component: Detail
  }
]

const Router = new VueRouter({
  routes,
  mode: 'history'
}
)

export default Router