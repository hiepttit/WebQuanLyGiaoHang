<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="4">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Shop"
          v-model="objAddOrder.IdShop"
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
          @click="(isShow = true), (objAddOrder = {})"
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
              :items="Orders"
              :options.sync="options"
              :server-items-length="total"
              :loading="loading"
              @page-count="pageCount = $event"
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
                v-model="options.page"
                :length="pageCount"
                :total-visible="7"
              ></v-pagination>
            </div>
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
    <input-detail
      :user="objAddOrder"
      :isShow="isShow"
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
import InputDetail from "./Inputcomponents/InputOrderDetail.vue";
import moment from "moment";

export default {
  components: { InputDetail },
  name: "Orders",
  async mounted() {
    this.Province = await this.getProvince();
    this.Shop = await this.getShop();
    this.getDataFromApi();
  },
  watch: {
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
    },
    async ProvinceId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `${this.url}/District?$filter=ProvinceId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.District = data.value;
        }
        let respName = await this.$stores.api.get(
          `${this.url}/Province?$filter=Id eq ${val}`
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
          `${this.url}/odata/Ward?$filter=DistrictId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.Ward = data.value;
        }
        let respName = await this.$stores.api.get(
          `${this.url}/odata/District?$filter=Id eq ${val}`
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
          `${this.url}/odata/Ward?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.WardName = data.value[0].Type + " " + data.value[0].Name;
        }
      }
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
      pageCount: 0,
      options: {},
      total: 0,
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      menu: false,
      isShow: false,
      loading: true,
      totalShop: 0,
      Shop: [],
      Orders: [],
      objAddOrder: {},
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
    async getShop() {
      let resp = await this.$stores.api.get(
        `${this.url}/TheUserView?$filter=IdRole eq 3&$orderby=Name asc`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return [];
    },
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
    async SaveModal(e) {
      this.objAddOrder = e;
      let objAddOrder = this.objAddOrder;
      let url = `${this.url}/Orders`;
      let resp = await this.$stores.api.post(`${url}`, objAddOrder);
      if ((resp && resp.status == 200) || resp.status == 201) {
        alert("Updated successfully.");
        this.isShow = false;
        this.getDataFromApi();
      } else {
        alert("Updated failed.");
      }
    },
    getDataFromApi() {
      this.loading = true;
      this.fakeApiCall().then((data) => {
        this.Orders = data.items;
        this.total = data.total;
        this.loading = false;
      });
    },
    async fakeApiCall() {
      const { sortBy, page, itemsPerPage } = this.options;

      let data = await this.getOrders(page, itemsPerPage);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getOrders(page, itemsPerPage) {
      let top = "";
      let skip = "";
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      // let filter = search && ` contains(Name, '${search}')`;
      let url = `${this.url}/Orders?$count=true${top}${skip}`;
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
