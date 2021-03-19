<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Shop"
          v-model="IdShop"
          label="Tên Shop*"
          :rules="[(v) => !!v || 'Item is required']"
          required
          style="width:40%;margin: 0 auto;"
        ></v-select>
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
              class="disabled"
              v-model="dateFormatted"
              label="Hôm nay:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              @blur="date = parseDate(dateFormatted)"
              style="width:40%;margin: 0 auto;"
              v-on="on"
            ></v-text-field>
          </template>
        </v-menu>
      </v-col>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ total }}</h1>
        <base-material-card color="green" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng
              <v-card-title style="width: 200px; float: right">
                <v-text-field
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  v-model="search"
                  hide-details
                ></v-text-field>
              </v-card-title>
            </div>

            <div class="subtitle-1 font-weight-light">
              Danh sách tất cả đơn hàng
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
              <template v-slot:item.Cod="{ item }">
                <div>{{ formatNumber(item.Cod) }}</div>
              </template>
              <template v-slot:item.ShipFee="{ item }">
                <div>{{ formatNumber(item.ShipFee) }}</div>
              </template>
              <template v-slot:item.Sum="{ item }">
                <div>{{ formatNumber(item.ShipFee + item.Cod) }}</div>
              </template>
              <template v-slot:item.DelayDate="{ item }">
                <div>
                  {{
                    monentDate(formatStringDate(item.StockOrders[0].Delaydate))
                  }}
                </div>
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
  </v-container>
</template>

<script>
import moment from "moment";

export default {
  metaInfo: {
    title: "Quan Ly Ton Kho",
  },
  async mounted() {
    this.Shop = await this.getShop();
    this.getDataFromApi();
  },
  watch: {
    options: {
      immediate: false,
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
    },
    IdShop(val) {
      this.getDataFromApi();
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
    },
  },
  data() {
    return {
      IdShop: "",
      pageCount: 0,
      options: {},
      total: 0,
      IdOrder: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      menu: false,
      isShow: false,
      Show: false,
      loading: true,
      Shop: [],
      Orders: [],
      objAddOrder: {},
      search: "",
      url: "http://localhost:60189/odata",
      headers: [
        {
          text: "Stt",
          align: "center",
          sortable: false,
          value: "Stt",
        },
        {
          text: "Mã",
          align: "start",
          sortable: false,
          value: "Id",
        },
        { text: "Tên khách hàng", align: "start", value: "CustomerName" },
        { text: "Địa chỉ", value: "TheAddress", align: "left" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        { text: "COD", value: "Cod" },
        { text: "Ship", value: "ShipFee" },
        { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
        { text: "Ngày giao", value: "DelayDate" },
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
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    formatStringDate(date) {
      return new Date(date).toLocaleDateString();
    },
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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
      const search = this.search;
      let data = await this.getStockOrders(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getStockOrders(page, itemsPerPage, search) {
      let top = "";
      let skip = "";
      if (this.IdShop) {
        if (itemsPerPage > 0) {
          top = `&$top=${itemsPerPage}`;
          skip = `&$skip=${(page - 1) * itemsPerPage}`;
        }
        let filter = search && ` and contains(Id, '${search}')`;
        let url = `${this.url}/Orders?$expand=StockOrders&$filter=StockOrders/any(x:x/Delaydate ne null) and StockOrders/any(x:x/Delaydate Ge ${this.DateOfIssueIdNumber}) and IdShop eq '${this.IdShop}'${filter}&$count=true${top}${skip}`;
        let resp = await this.$stores.api.get(`${url}`);
        if (resp && resp.status == 200) {
          let data = await resp.json();
          let total = data["@odata.count"];
          return {
            total,
            items: data.value,
          };
        }
      }
      return { total: 0, items: [] };
    },
    PrintCode() {
      window.print();
    },
    formatNumber(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
  },
};
</script>
<style lang="scss">
.disabled {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6;
  border-color: #d1dbe5;
}
@media print {
  body {
    visibility: hidden;
  }
  #printImg {
    visibility: visible;
    position: absolute;
    left: 0;
    top: 0;
  }
  svg {
    width: 90%;
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
}
</style>
