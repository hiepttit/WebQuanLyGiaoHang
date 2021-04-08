<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-row>
        <v-col cols="12" style="margin-left: 20px">
          <v-text-field
            v-model="salary"
            label="Lương cơ bản"
            style="float:left;padding:0"
            single-line
            hide-details
          ></v-text-field>
          <v-btn color="success" rounded class="mr-0" @click="changeSalary()">
            Ok
          </v-btn>
        </v-col>
        <v-col cols md="6" style="text-align:center">
          <h1 class="ml-10">Tổng nhân viên: {{ totalStaffs }}</h1>
        </v-col>
        <v-row>
          <v-col cols="12" md="6" style="text-align:center">
            <v-col>
              <v-btn
                color="success"
                rounded
                class="mr-0"
                @click="
                  (isShow = true),
                    (objAddUser = {}),
                    (IdProvince = []),
                    (isCreate = true)
                "
              >
                Thêm
              </v-btn>
              <v-btn color="success" rounded class="mr-3" @click="print()">
                In
              </v-btn>
            </v-col>
          </v-col>
        </v-row>
      </v-row>

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
                <template v-slot:item.Action="{ item }">
                  <div class="text-left">
                    <i
                      aria-hidden="true"
                      class="v-icon notranslate mdi mdi-pencil-plus"
                      style="margin-left: 10px;cursor: pointer;"
                      @click="
                        (isShowUp = true),
                          (objAddUser = item),
                          (IdUser = item.Id),
                          (IdProvince = []),
                          (isCreate = false)
                      "
                    ></i>
                  </div>
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
                <template v-slot:item.Action="{ item }">
                  <div class="text-left">
                    <i
                      aria-hidden="true"
                      class="v-icon notranslate mdi mdi-pencil-plus"
                      style="margin-left: 10px;cursor: pointer;"
                      @click="
                        (isShowUp = true),
                          (objAddUser = item),
                          (IdUser = item.Id),
                          (IdProvince = [])
                      "
                    ></i>
                  </div>
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
      :Create="isCreate"
      @update="
        (e) => {
          SaveModal(e);
        }
      "
      @close="isShow = false"
    />
    <input-detail
      :user="objAddUser"
      :IdProvince="IdProvince"
      :isShow="isShowUp"
      :Create="isCreate"
      @update="
        (e) => {
          changeInfo(e);
        }
      "
      @close="isShowUp = false"
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
    let preSalary = await this.getSalary();
    this.salary = preSalary[0].Salary;
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
      IdUser: "",
      pageCountStaff: 0,
      pageCountShop: 0,
      IdProvince: null,
      objAddUser: {},
      isCreate: false,
      url: this.$urlApi,
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
        { text: "Tác Vụ", value: "Action" },
      ],
      isShowUp: false,
      salary: 0,
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
    async getSalary() {
      let url = `${this.url}/BasicSalary`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return [];
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
      // let url = `${this.url}/District?$count=true${top}${skip}`;
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
    async changeInfo(e) {
      this.objAddUser = e;
      this.objAddUser.Id = this.IdUser;
      let objAddUser = this.objAddUser;
      let url = `${this.url}/TheUsers/${this.IdUser}`;
      let resp = await this.$stores.api.patch(`${url}`, objAddUser);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.isShowUp = false;
        this.getDataFromApi();
      } else {
        alert("Updated failed.");
      }
    },
    async changeSalary() {
      let url = `${this.url}/BasicSalary/1`;
      let obj = {};
      obj.Salary = this.salary;
      let resp = await this.$stores.api.patch(`${url}`, obj);
      if (resp && resp.status == 200) {
        this.getDataFromApi();
      } else {
        alert("Updated failed.");
      }
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
