import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('@/views/dashboard/Dashboard'),
        },
        // Pages
        // Table
        {
          name: 'DataTable',
          path: 'datatable',
          component: () => import('@/views/dashboard/Datatable'),
        },
        // Order
        {
          name: 'Tạo giao hàng',
          path: 'orders',
          component: () => import('@/views/dashboard/MyOrders/Orders'),
        },
        // Manager Orders
        {
          name: 'Quản lý giao hàng',
          path: 'Manager_orders',
          component: () => import('@/views/dashboard/MyOrders/Manager'),
        },
      ],
    },
  ],
})
