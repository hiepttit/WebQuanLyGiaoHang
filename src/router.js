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
          name: 'Quản lý người dùng',
          path: 'datatable',
          component: () => import('@/views/dashboard/User'),
        },
        // Order
        {
          name: 'Tạo đơn hàng',
          path: 'orders',
          component: () => import('@/views/dashboard/MyOrder/Orders'),
        },
        // Delevery
        {
          name: 'Tạo giao hàng',
          path: 'Create_delivery',
          component: () => import('@/views/dashboard/MyDelivery/Delivery'),
        },
        // Manager Delevery
        {
          name: 'Quản lý giao hàng',
          path: 'Manager_delivery',
          component: () => import('@/views/dashboard/MyDelivery/Manager'),
        },
         // Manager Stock Orders
        {
          name: 'Quản lý tồn kho',
          path: 'Manager_stock_orders',
          component: () => import('@/views/dashboard/StockOrder'),
        },
        // Manager Orders
        {
          name: 'Quản lý đơn hàng',
          path: 'Manager_orders',
          component: () => import('@/views/dashboard/MyOrder/ManagerOrder'),
        },
        // Statistical Staff
        {
          name: 'Thống kê đơn hàng nhân viên',
          path: 'Statistical_Staff',
          component: () => import('@/views/dashboard/Statistical/StatisticalStaff'),
        },
      ],
    },
  ],
})
