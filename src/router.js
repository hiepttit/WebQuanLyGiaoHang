import Vue from 'vue'
import Router from 'vue-router'
import Meta from "vue-meta";

Vue.use(Router)
Vue.use(Meta);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '/dashboard',
          component: () => import('@/views/dashboard/Dashboard'),
        },
        // Pages
        // Table
        {
          name: 'Quản lý người dùng',
          path: '',
          component: () => import('@/views/dashboard/User'),
        },
        // Order
        {
          name: 'Tạo đơn hàng',
          path: 'TaoDonHang',
          component: () => import('@/views/dashboard/MyOrder/Orders'),
          meta: {
            title: "Tao Don Hang",
          }
        },
        // Delevery
        {
          name: 'Tạo giao hàng',
          path: 'TaoGiaoHang',
          component: () => import('@/views/dashboard/MyDelivery/Delivery'),
        },
        // Manager Delevery
        {
          name: 'Quản lý giao hàng',
          path: 'QuanLyGiaoHang',
          component: () => import('@/views/dashboard/MyDelivery/ManagerDelivery'),
        },
         // Manager Stock Orders
        {
          name: 'Quản lý tồn kho',
          path: 'QuanLyTonKho',
          component: () => import('@/views/dashboard/StockOrder'),
        },
        // Manager Orders
        {
          name: 'Quản lý đơn hàng',
          path: 'QuanLyDonHang',
          component: () => import('@/views/dashboard/MyOrder/ManagerOrder'),
        },
        // Statistical Staff
        {
          name: 'Thống kê nhân viên',
          path: 'ThongKeNhanVien',
          component: () => import('@/views/dashboard/Statistical/StatisticalStaff'),
        },
        // Statistical Shop
        {
          name: 'Thống kê Shop',
          path: 'ThongKeShop',
          component: () => import('@/views/dashboard/Statistical/StatisticalShop'),
        },
        // Revenue
        {
          name: 'Doanh thu',
          path: 'DoanhThu',
          component: () => import('@/views/dashboard/Statistical/Revenue'),
        },
        // Search
        {
          name: 'Tim kiem',
          path: 'TimKiem',
          component: () => import('@/views/dashboard/Search'),
        },
      ],
    },
  ],
})
