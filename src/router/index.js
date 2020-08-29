import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
// import User from '../components/users/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const User = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/users/User.vue')
const Rights = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/Roles.vue')
// import Cate from '../components/goods/cate.vue'
// import Params from '../components/goods/Params.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')
// import Goods from '../components/goods/Goods.vue'
// import goodsAdd from '../components/goods/goodsAdd.vue'
const Goods = () => import(/* webpackChunkName: "Goods_goodsAdd" */ '../components/goods/Goods.vue')
const goodsAdd = () => import(/* webpackChunkName: "Goods_goodsAdd" */ '../components/goods/goodsAdd.vue')
// import OrderList from '../components/order/orderList.vue'
// import Report from '../components/reports/Report.vue'
const OrderList = () => import(/* webpackChunkName: "OrderList_Report" */ '../components/order/orderList.vue')
const Report = () => import(/* webpackChunkName: "OrderList_Report" */ '../components/reports/Report.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: 'login' },
    { path: '/login', component: Login },
    {
       path: '/home',
       component: Home,
       children: [
      { path: '/', redirect: '/welcome' },
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: goodsAdd },
      { path: '/orders', component: OrderList },
      { path: '/reports', component: Report }
    ]
  }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
