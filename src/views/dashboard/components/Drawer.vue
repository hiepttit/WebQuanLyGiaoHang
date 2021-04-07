<template>
  <v-navigation-drawer
    id="core-navigation-drawer"
    v-model="drawer"
    :dark="barColor !== 'rgba(228, 226, 226, 1), rgba(255, 255, 255, 0.7)'"
    :expand-on-hover="expandOnHover"
    :right="$vuetify.rtl"
    :src="barImage"
    mobile-breakpoint="960"
    app
    width="260"
    v-bind="$attrs"
  >
    <template v-slot:img="props">
      <v-img :gradient="`to bottom, ${barColor}`" v-bind="props" />
    </template>

    <v-divider class="mb-1" />

    <v-list dense nav>
      <v-list-item>
        <v-list-item-avatar class="align-self-center" color="white" contain>
          <v-img src="../../../assets/devship.jpg" max-height="30" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title
            style="line-height:normal; font-size:15px !important"
            class="display-1"
            v-text="profile.title"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider class="mb-2" />

    <v-list expand nav>
      <div />

      <template v-for="(item, i) in computedItems">
        <base-item-group v-if="item.children" :key="`group-${i}`" :item="item">
          <!--  -->
        </base-item-group>

        <base-item v-else :key="`item-${i}`" :item="item" />
      </template>
      <div />
    </v-list>

    <!-- <template v-slot:append>
      <base-item
        :item="{
          title: $t('upgrade'),
          icon: 'mdi-package-up',
          to: '/upgrade'
        }"
      />
    </template> -->
  </v-navigation-drawer>
</template>

<script>
// Utilities
import { mapState } from "vuex";

export default {
  name: "DashboardCoreDrawer",

  props: {
    expandOnHover: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    items: [
      // {
      //   icon: "mdi-view-dashboard",
      //   title: "dashboard",
      //   to: "/",
      // },
      {
        title: "Quản lý người dùng",
        icon: "mdi-account-tie",
        to: "/",
      },
      {
        title: "Tạo Đơn Hàng",
        icon: "mdi-pencil-outline",
        to: "/TaoDonHang",
      },
      {
        title: "Tạo Giao Hàng",
        icon: "mdi-pencil-outline",
        to: "/TaoGiaoHang",
      },
      {
        title: "Quản lý giao hàng",
        icon: "mdi-mouse",
        to: "/QuanLyGiaoHang",
      },
      {
        title: "Quản lý tồn kho",
        icon: "mdi-mouse",
        to: "/QuanLyTonKho",
      },
      {
        title: "Quản lý đơn hàng",
        icon: "mdi-mouse",
        to: "/QuanLyDonHang",
      },
      {
        title: "Thống kê nhân viên",
        icon: "mdi-mouse",
        to: "/ThongKeNhanVien",
      },
      {
        title: "Thống kê Shop",
        icon: "mdi-mouse",
        to: "/ThongKeShop",
      },
      {
        title: "Doanh thu",
        icon: "mdi-mouse",
        to: "/DoanhThu",
      },
      {
        title: "Tìm kiếm",
        icon: "mdi-magnify",
        to: "/TimKiem",
      },
    ],
  }),

  computed: {
    ...mapState(["barColor", "barImage"]),
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(val) {
        this.$store.commit("SET_DRAWER", val);
      },
    },
    computedItems() {
      return this.items.map(this.mapItem);
    },
    profile() {
      return {
        avatar: true,
        title: "QUẢN LÝ GIAO HÀNG",
      };
    },
  },

  methods: {
    mapItem(item) {
      return {
        ...item,
        children: item.children ? item.children.map(this.mapItem) : undefined,
        title: this.$t(item.title),
      };
    },
  },
};
</script>

<style lang="sass">
@import '~vuetify/src/styles/tools/_rtl.sass'

#core-navigation-drawer
  .v-list-group__header.v-list-item--active:before
    opacity: .24

  .v-list-item
    &__icon--text,
    &__icon:first-child
      justify-content: center
      text-align: center
      width: 20px

      +ltr()
        margin-right: 24px
        margin-left: 12px !important

      +rtl()
        margin-left: 24px
        margin-right: 12px !important

  .v-list--dense
    .v-list-item
      &__icon--text,
      &__icon:first-child
        margin-top: 10px

  .v-list-group--sub-group
    .v-list-item
      +ltr()
        padding-left: 8px

      +rtl()
        padding-right: 8px

    .v-list-group__header
      +ltr()
        padding-right: 0

      +rtl()
        padding-right: 0

      .v-list-item__icon--text
        margin-top: 19px
        order: 0

      .v-list-group__header__prepend-icon
        order: 2

        +ltr()
          margin-right: 8px

        +rtl()
          margin-left: 8px
</style>
