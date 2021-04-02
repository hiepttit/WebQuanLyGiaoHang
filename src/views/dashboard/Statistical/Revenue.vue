<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" style="text-align: center;">
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
              label="Ngày:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              @blur="date = parseDate(dateFormatted)"
              style="width:40%;margin: 0 auto;"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="DateOfIssueIdNumber"
            @input="menu = false"
          ></v-date-picker>
        </v-menu>
        <v-row>
          <v-col cols="6" md="4" class="inputDate">
            <v-menu
              v-model="menuFrom"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="fromDate"
                  label="Từ Ngày:"
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  @blur="date = parseDate(fromDate)"
                  style="float:right;margin: 0 auto;"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="FromDate"
                @input="menuFrom = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="6" md="4" class="inputDate">
            <v-menu
              v-model="menuTo"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="toDate"
                  label="Đến Ngày:"
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  @blur="date = parseDate(toDate)"
                  style="float:left;margin: 0 auto;"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="ToDate"
                @input="menuTo = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="success"
              id="btnPrint"
              rounded
              class="mr-3"
              @click="filterGroupDate()"
            >
              Thống kê
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              color="success"
              id="btnPrint"
              rounded
              class="mr-3"
              @click="print()"
            >
              In
            </v-btn>
            <v-btn
              color="success"
              id="btnPrint"
              rounded
              class="mr-3"
              @click="exportExcel()"
            >
              Xuất excel
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-row id="printed-content">
        <v-col class="post-content" cols="12" md="12">
          <base-material-card color="warning" class="px-5 py-3">
            <template v-slot:heading>
              <div class="display-2 font-weight-light">
                Doanh thu
                <v-card-title style="width: 200px; float: right">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
              </div>

              <div class="subtitle-1 font-weight-light">
                Danh sách doanh thu
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
                  <template v-if="item.RealReceive > 0">
                    <div>{{ formatNumber(item.RealReceive) }}</div>
                  </template>
                  <template v-else>
                    <div>0</div>
                  </template>
                </template>
                <template v-slot:item.Res="{ item }">
                  <template v-if="item.TheStatus == 2 || item.TheStatus == 3">
                    <div>0</div>
                  </template>
                  <template v-else>
                    <div>{{ formatNumber(item.ShipFee - item.Amount) }}</div>
                  </template>
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
    </v-row>
  </v-container>
</template>
<script>
import moment from "moment";
import XLSX from "xlsx";

export default {
  metaInfo: {
    title: "Quan Ly Nguoi Dung",
  },
  async mounted() {
    this.Users = await this.getUser();
  },
  watch: {
    options: {
      immediate: false,
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
    },
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(val);
      this.getDataFromApi();
    },
    FromDate(val) {
      this.fromDate = this.formatDate(val);
    },
    ToDate(val) {
      this.toDate = this.formatDate(val);
    },
  },
  data() {
    return {
      Users: [],
      total: 0,
      Orders: [],
      loading: true,
      options: {},
      search: "",
      pageCount: 0,
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      FromDate: new Date().toISOString().substr(0, 10),
      fromDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      ToDate: new Date().toISOString().substr(0, 10),
      toDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      menuFrom: false,
      menuTo: false,
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
        { text: "COD", value: "Cod" },
        { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
        { text: "Tên nhân viên", align: "start", value: "UserName" },
        { text: "Lương", value: "Amount" },
        { text: "Doanh thu", value: "Res" },
      ],
      isShowUp: false,
      salary: 0,
    };
  },
  methods: {
    async getUser() {
      let resp = await this.$stores.api.get(
        `${this.url}/TheUserView?$filter=IdRole eq 2&$orderby=Name asc`
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
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    getDataFromApi() {
      this.loadingStaff = true;
      this.fakeApiCall().then((data) => {
        let res = data.items;
        this.Orders = res.map((_) => {
          return {
            Id: _.Id,
            CustomerName: _.CustomerName,
            Cod: _.Cod,
            UserName: this.Users.find(
              (u) => u.Id == _.DeliveryOrders[0].IdStaff
            ).Name,
            ShipFee: _.ShipFee,
            RealReceive: _.RealReceive,
            Amount: _.DeliveryOrders[0].Amount,
            TheStatus: _.TheStatus,
          };
        });
        this.total = data.total;
        this.loading = false;
      });
    },
    async fakeApiCall() {
      const { sortBy, page, itemsPerPage } = this.options;
      const search = this.search;

      let data = await this.getOrder(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getOrder(page, itemsPerPage, search) {
      let top = "";
      let skip = "";
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      let filter = search && `and contains(Name, '${search}')`;
      let url = `${this.url}/Orders?$expand=DeliveryOrders&$count=true${top}${skip}&$filter=CreatedAt eq ${this.DateOfIssueIdNumber}${filter}`;

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
    async filterGroupDate() {
      this.loading = true;
      this.getDeliveryDate().then((data) => {
        let res = data.items;
        this.Orders = res.map((_) => {
          return {
            Id: _.Id,
            CustomerName: _.CustomerName,
            Cod: _.Cod,
            UserName: this.Users.find(
              (u) => u.Id == _.DeliveryOrders[0].IdStaff
            ).Name,
            ShipFee: _.ShipFee,
            RealReceive: _.RealReceive,
            Amount: _.DeliveryOrders[0].Amount,
            TheStatus: _.TheStatus,
          };
        });
        this.loading = false;
      });
    },
    async getDeliveryDate() {
      let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=CreatedAt ge ${this.FromDate} and CreatedAt le ${this.ToDate}&$count=true`;
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
    formatNumber(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    formatJson(filterVal, jsonData) {
      let data = jsonData.map((v) => {
        return {
          Number: jsonData.findIndex((_) => _.Id == v.Id) + 1,
          Id: v.Id,
          CustomerName: v.CustomerName,
          Cod: v.Cod,
          ShipFee: v.ShipFee,
          Sum: v.RealReceive && v.RealReceive > 0 ? v.RealReceive : 0,
          UserName: v.UserName,
          Amount: v.Amount,
          Res: v.TheStatus == 2 || v.TheStatus == 3 ? 0 : v.ShipFee - v.Amount,
        };
      });
      let res = data.map((v) => filterVal.map((j) => v[j]));
      return res;
    },
    exportExcel() {
      const filterVal = [
        "Number",
        "Id",
        "CustomerName",
        "Cod",
        "ShipFee",
        "Sum",
        "UserName",
        "Amount",
        "Res",
      ];
      const headerDisplay = [
        "Stt",
        "Mã",
        "Tên khách",
        "COD",
        "Ship",
        "Tổng thu",
        "Tên nhân viên",
        "Lương nhân viên",
        "Doanh thu",
      ];
      const Name = [];
      Name.push(this.dateFormatted);
      Name.push("Từ ngày:" + this.fromDate);
      Name.push("Tới ngày:" + this.toDate);

      const dataSuccess = this.formatJson(filterVal, this.Orders);
      const successData = [headerDisplay, ...dataSuccess];
      const newDataSuccess = [Name, ...successData];

      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(newDataSuccess);

      ws.font = { size: 13 };
      let wscols = [
        { wch: 5 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
      ];
      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "DonHangGiao");

      XLSX.writeFile(wb, "QuanLyGiaoHang.xlsx");
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
