<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="4">
        <v-select
          item-text="Name"
          item-value="Name"
          :items="Shop"
          label="Tên Shop*"
          :rules="[(v) => !!v || 'Item is required']"
          required
          style="float: right"
        ></v-select>
      </v-col>
      <v-col cols="2">
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateFormatted"
              label="Ngày cấp:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              @blur="date = parseDate(dateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="DateOfIssueIdNumber"
            @input="menu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="4">
        <v-btn
          color="success"
          style="float: right"
          rounded
          class="mr-0"
          @click="isShow = true"
        >
          Thêm
        </v-btn>
      </v-col>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ totalShop }}</h1>
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
                <div>Ngày cấp: {{ monentDate(item.DateOfIssueIdNumber) }}</div>
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
    <my-Modal :title="'Tạo giao hàng'" :show="isShow" @close="isShow = false">
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          label="Họ tên khách hàng:*"
          v-model="objAddUser.Name"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          label="Số điện thoại"
          v-model="objAddUser.PhoneNumber"
          type="number"
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="address"
          label="Địa chỉ:"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Province"
          label="Tỉnh/Thành phố*"
          v-model="ProvinceId"
          required
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="District"
          v-bind:class="{ disabled: District.length ? false : true }"
          label="Quận/Huyện/Thành phố/Thị xã*"
          v-model="DistrictId"
          required
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Ward"
          v-bind:class="{ disabled: Ward.length ? false : true }"
          label="Phường/Xã*"
          v-model="WardId"
          required
        ></v-select>
      </v-col>
      <v-col cols="6">
        <v-text-field
          type="number"
          label="COD:"
          required
          v-model="objAddUser.BankAccountNumber"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          type="number"
          label="Ship:"
          required
          v-model="objAddUser.BankAccountNumber"
        ></v-text-field>
      </v-col>
      <template v-slot:m-foot>
        <v-btn color="blue darken-1" text @click="SaveModal(objAddUser)">
          Save
        </v-btn>
      </template>
    </my-Modal>
  </v-container>
</template>

<script>
import myModal from "./components/core/Modal";
import moment from "moment";

export default {
  components: { myModal },
  name: "Delivered",
  async mounted() {
    this.Province = await this.getProvince();
    this.getDataShopFromApi();
    // this.Staff = await this.getStaff();
  },
  watch: {
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
    },
    async ProvinceId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `http://localhost:60189/odata/District?$filter=ProvinceId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.District = data.value;
        }
        let respName = await this.$stores.api.get(
          `http://localhost:60189/odata/Province?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.ProvinceName = data.value[0].Name;
        }
      }
    },
    async DistrictId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `http://localhost:60189/odata/Ward?$filter=DistrictId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.Ward = data.value;
        }
        let respName = await this.$stores.api.get(
          `http://localhost:60189/odata/District?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.DistrictName = data.value[0].Name;
        }
      }
    },
    async WardId(val) {
      if (val) {
        let respName = await this.$stores.api.get(
          `http://localhost:60189/odata/Ward?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.WardName = data.value[0].Type + " " + data.value[0].Name;
        }
      }
    },
    optionsShop: {
      immediate: false,
      handler() {
        this.getDataShopFromApi();
      },
      deep: true,
    },
    searchShop: {
      handler(val) {
        this.getDataShopFromApi();
      },
    },
  },
  data() {
    return {
      Province: [],
      ProvinceId: null,
      ProvinceName: "",
      District: [],
      DistrictId: null,
      DistrictName: "",
      Ward: [],
      WardId: null,
      WardName: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      menu: false,
      isShow: false,
      Staffs: [],
      totalShop: 0,
      Shop: [],
      loadingShop: true,
      optionsShop: {},
      pageCountShop: 0,
      objAddUser: {},
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
    async getProvince() {
      let resp = await this.$stores.api.get(
        `${this.url}/Province?$orderBy=Name asc`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    async SaveModal(objAddUser) {
      objAddUser.TheAddress =
        this.address +
        ", " +
        this.WardName +
        ", " +
        this.DistrictName +
        ", " +
        this.ProvinceName;
      objAddUser.DateOfIssueIdNumber = this.DateOfIssueIdNumber;
      let url = "http://localhost:60189/odata/TheUsers";
      let resp = await this.$stores.api.post(`${url}`, objAddUser);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.isShow = false;
        // this.data.reload(true);
      } else {
        alert("Updated failed.");
      }
      console.log(objAddUser);
      debugger;
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
    async getShop(page, itemsPerPage, searchShop) {
      let top = "";
      let skip = "";
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      let filter = searchShop && `and contains(Name, '${searchShop}')`;
      let url = `http://localhost:60189/odata/TheUserView?$count=true${top}${skip}&$filter=IdRole eq 3 ${filter}`;
      // let url = `http://localhost:60189/odata/District`;
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
  },
};
</script>
<style scoped>
.disabled {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6;
  border-color: #d1dbe5;
}
</style>
