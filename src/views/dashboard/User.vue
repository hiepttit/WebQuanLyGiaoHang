<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="6" md="6">
        <h1 class="ml-10">Tổng nhân viên: {{ totalStaffs }}</h1>
      </v-col>
      <v-col cols="6" md="4">
        <v-btn
          color="success"
          style="float: right"
          rounded
          class="mr-0"
          @click="(isShow = true), (objAddUser = {}), (IdProvince = [])"
        >
          Thêm
        </v-btn>
        <v-btn
          color="success"
          style="float: right"
          rounded
          class="mr-3"
          @click="print()"
        >
          In
        </v-btn>
      </v-col>
      <v-row id="printed-content">
        <v-col class="post-content" cols="12" md="12">
          <base-material-card color="warning" class="px-5 py-3">
            <template v-slot:heading>
              <div class="display-2 font-weight-light">
                Nhân viên
                <v-card-title style="width: 200px; float: right">
                  <v-text-field
                    v-model="searchStaff"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
              </div>

              <div class="subtitle-1 font-weight-light">
                Danh sách tất cả nhân viên
              </div>
            </template>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="Staffs"
                :options.sync="optionsStaff"
                :server-items-length="totalStaffs"
                :loading="loadingStaff"
                @page-count="pageCountStaff = $event"
              >
                <template v-slot:item.Stt="{ index }">
                  {{ index + 1 }}
                </template>
                <template v-slot:item.CMND="{ item }">
                  Số: {{ item.IdNumber }}
                  <div>
                    Ngày cấp: {{ monentDate(item.DateOfIssueIdNumber) }}
                  </div>
                  <div>Nơi cấp: {{ item.PlaceOfIssueIdNumber }}</div>
                </template>
                <template v-slot:item.Bank="{ item }">
                  Số: {{ item.BankAccountNumber }}
                  <div>Ngân hàng: {{ item.BankName }}</div>
                </template>
              </v-data-table>
              <div class="text-center pt-2">
                <v-pagination
                  v-model="optionsStaff.page"
                  :length="pageCountStaff"
                  :total-visible="7"
                ></v-pagination>
              </div>
            </v-card-text>
          </base-material-card>
        </v-col>
        <v-col cols="6" md="6">
          <h1 class="ml-10">Tổng Shop: {{ totalShop }}</h1>
        </v-col>
        <v-col cols="12" md="12">
          <base-material-card color="green" class="px-5 py-3">
            <template v-slot:heading>
              <div class="display-2 font-weight-light">
                Shop
                <v-card-title style="width: 200px; float: right">
                  <v-text-field
                    v-model="searchShop"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
              </div>

              <div class="subtitle-1 font-weight-light">
                Danh sách tất cả Shop
              </div>
            </template>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="Shop"
                :options.sync="optionsShop"
                :server-items-length="totalShop"
                :loading="loadingShop"
                @page-count="pageCountShop = $event"
              >
                <template v-slot:item.Stt="{ index }">
                  {{ index + 1 }}
                </template>
                <template v-slot:item.CMND="{ item }">
                  Số: {{ item.IdNumber }}
                  <div>
                    Ngày cấp: {{ monentDate(item.DateOfIssueIdNumber) }}
                  </div>
                  <div>Nơi cấp: {{ item.PlaceOfIssueIdNumber }}</div>
                </template>
                <template v-slot:item.Bank="{ item }">
                  Số: {{ item.BankAccountNumber }}
                  <div>Ngân hàng: {{ item.BankName }}</div>
                </template>
              </v-data-table>
              <div class="text-center pt-2">
                <v-pagination
                  v-model="optionsShop.page"
                  :length="pageCountShop"
                  :total-visible="7"
                ></v-pagination>
              </div>
            </v-card-text>
          </base-material-card>
        </v-col>
      </v-row>
    </v-row>
    <input-detail
      :user="objAddUser"
      :isShow="isShow"
      :IdProvince="IdProvince"
      class="printed-content"
      @update="
        (e) => {
          SaveModal(e);
        }
      "
      @close="isShow = false"
    />
  </v-container>
</template>

<script>
import InputDetail from "./Inputcomponents/InputUserDetail.vue";
import moment from "moment";
export default {
  components: { InputDetail },
  metaInfo: {
    title: "Quan Ly Nguoi Dung",
  },
  async mounted() {
    this.getDataFromApi();
    this.getDataShopFromApi();
  },
  watch: {
    optionsStaff: {
      immediate: false,
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    optionsShop: {
      immediate: false,
      handler() {
        this.getDataShopFromApi();
      },
      deep: true,
    },
    searchStaff: {
      handler(val) {
        this.getDataFromApi();
      },
    },
    searchShop: {
      handler(val) {
        this.getDataShopFromApi();
      },
    },
  },
  data() {
    return {
      isShow: false,
      totalStaffs: 0,
      Staffs: [],
      totalShop: 0,
      Shop: [],
      loadingStaff: true,
      loadingShop: true,
      optionsStaff: {},
      optionsShop: {},
      searchStaff: "",
      searchShop: "",
      pageCountStaff: 0,
      pageCountShop: 0,
      IdProvince: null,
      objAddUser: {},
      url: "http://localhost:60189/odata",
      headers: [
        {
          text: "Stt",
          align: "center",
          sortable: false,
          value: "Stt",
        },
        {
          text: "Họ Tên",
          align: "start",
          sortable: false,
          value: "Name",
        },
        { text: "Tài khoản", align: "start", value: "UserName" },
        { text: "CMND", value: "CMND", align: "center" },
        { text: "Địa Chỉ", value: "TheAddress" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        { text: "Tài khoản ngân hàng", value: "Bank" },
      ],
    };
  },

  methods: {
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    async SaveModal(e) {
      if (!e) {
        alert("Bạn phải nhập đủ thông tin");
        return;
      }
      this.objAddUser = e;
      let objAddUser = this.objAddUser;
      let url = `http://localhost:60189/api/Authenticate/register-admin`;
      let resp = await this.$stores.api.post(`${url}`, objAddUser);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.isShow = false;
        this.getDataFromApi();
        this.getDataShopFromApi();
        // this.data.reload(true);
      } else {
        alert("Updated failed.");
      }
    },
    getDataFromApi() {
      this.loadingStaff = true;
      this.fakeStaffsApiCall().then((data) => {
        this.Staffs = data.items;
        this.totalStaffs = data.total;
        this.loadingStaff = false;
      });
    },
    async fakeStaffsApiCall() {
      const { sortBy, page, itemsPerPage } = this.optionsStaff;
      const searchStaff = this.searchStaff;

      let data = await this.getStaff(page, itemsPerPage, searchStaff);
      return {
        items: data.items,
        total: data.total,
      };
    },
    getDataShopFromApi() {
      this.loadingShop = true;
      this.fakeShopsApiCall().then((data) => {
        this.Shop = data.items;
        this.totalShop = data.total;
        this.loadingShop = false;
      });
    },
    async fakeShopsApiCall() {
      const { sortBy, page, itemsPerPage } = this.optionsShop;
      const searchShop = this.searchShop;

      let data = await this.getShop(page, itemsPerPage, searchShop);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getStaff(page, itemsPerPage, searchStaff) {
      let top = "";
      let skip = "";
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      let filter = searchStaff && `and contains(Name, '${searchStaff}')`;
      let url = `${this.url}/TheUserView?$count=true${top}${skip}&$filter=IdRole eq 2 ${filter}`;
      // let url = `http://localhost:60189/odata/District?$count=true${top}${skip}`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        let total = data["@odata.count"];
        return {
          total,
          items: data.value,
        };
      }
      return { total: 0, items: [] };
    },
    async getShop(page, itemsPerPage, searchShop) {
      let top = "";
      let skip = "";
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      let filter = searchShop && `and contains(Name, '${searchShop}')`;
      let url = `${this.url}/TheUserView?$count=true${top}${skip}&$filter=IdRole eq 3 ${filter}`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        let total = data["@odata.count"];
        return {
          total,
          items: data.value,
        };
      }
      return { total: 0, items: [] };
    },
    print() {
      window.print();
    },
  },
};
</script>
<style lang="scss">
@media print {
  body {
    visibility: hidden;
  }
  #printed-content {
    visibility: visible;
    position: absolute;
    left: 0;
    top: 0;
  }

  header {
    left: 0;
  }
  #core-navigation-drawer {
    display: none;
    transform: translateX(-100%);
  }
  .v-main {
    padding: 75px 0px 0px !important;
  }
  .book-date {
    page-break-after: always;
  }

  .post-content {
    page-break-before: always;
  }
  p {
    page-break-inside: avoid;
  }
}
</style>
