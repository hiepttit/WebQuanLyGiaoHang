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
        // Table
        {
          name: 'orders',
          path: 'orders',
          component: () => import('@/views/dashboard/Orders'),
        },
      ],
    },
  ],
})
