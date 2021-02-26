<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row id="printed-content">
      <v-col cols="12" md="12" style="text-align:center">
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
      <tableStatic
        :list="OrdersSuccess"
        :number="OrdersSuccess.length"
        :total="totalSuccess"
        :header="'Đơn hàng thành công'"
        :detail="'Danh sách tất cả đơn hàng thành công'"
        :color="'success'"
      />
      <template v-if="OrdersSuccessStock.length">
        <tableStatic
          :list="OrdersSuccessStock"
          :number="OrdersSuccessStock.length"
          :total="totalSuccessStock"
          :header="'Đơn hàng tồn kho đã hoàn thành'"
          :detail="'Danh sách tất cả đơn hàng tồn kho đã hoàn thành'"
          :color="'#1867c0'"
        />
      </template>
      <tableStatic
        :list="OrdersFail"
        :number="OrdersFail.length"
        :total="totalFail"
        :header="'Đơn hàng trả'"
        :detail="'Danh sách tất cả đơn hàng trả'"
        :color="'error'"
      />
      <tableStatic
        :list="OrdersDelay"
        :number="OrdersDelay.length"
        :total="totalDelay"
        :header="'Đơn hàng hoãn'"
        :detail="'Danh sách tất cả đơn hàng hoãn'"
        :color="'warning'"
        :delay="true"
      />
      <tableStatic
        :list="OrdersHalf"
        :number="OrdersHalf.length"
        :total="totalHalf"
        :header="'Đơn hàng thành công một phần'"
        :detail="'Danh sách tất cả đơn hàng thành công 1 phần'"
        :color="'#5cbbf6'"
      />
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import tableStatic from "./TableStatistical";
import XLSX from "xlsx";

export default {
  name: "Orders",
  components: { tableStatic },
  data() {
    return {
      total: 0,
      IdShop: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      Shop: [],
      Orders: [],
      OrdersSuccess: [],
      OrdersSuccessStock: [],
      OrdersDelay: [],
      OrdersFail: [],
      OrdersHalf: [],
      Receive: 0,
      totalSuccess: 0,
      totalDelay: 0,
      totalFail: 0,
      totalHalf: 0,
      totalSuccessStock: 0,
      url: "http://localhost:60189/odata",
    };
  },
  async mounted() {
    this.Shop = await this.getShop();
    this.getDataFromApi();
  },
  watch: {
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
      this.getDataFromApi();
    },
    IdShop(val) {
      this.getDataFromApi();
    },
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
      this.getDelivery().then((data) => {
        this.Orders = data.items;
        this.OrdersSuccess = data.items.filter((_) => _.TheStatus == 1);
        this.OrdersFail = data.items.filter((_) => _.TheStatus == 2);
        this.OrdersDelay = data.items.filter((_) => _.IsInStock == 1);
        this.OrdersHalf = data.items.filter((_) => _.TheStatus == 4);
        this.totalSuccess = this.sum(
          data.items.filter((_) => _.TheStatus == 1),
          "RealReceive"
        );
        this.totalFail = this.sum(
          data.items.filter((_) => _.TheStatus == 2),
          "RealReceive"
        );
        this.totalDelay = this.sum(
          data.items.filter((_) => _.IsInStock == 1),
          "RealReceive"
        );
        this.totalHalf = this.sum(
          data.items.filter((_) => _.TheStatus == 4),
          "RealReceive"
        );
        this.total = data.total;
        this.loading = false;
      });
      this.getStockDelivery().then((data) => {
        this.Orders = data.items;
        this.OrdersSuccessStock = data.items.filter(
          (_) => _.IsInStock == 1 && _.TheStatus != 3
        );
        this.totalSuccessStock = this.sum(
          data.items.filter((_) => _.IsInStock == 1 && _.TheStatus != 3),
          "RealReceive"
        );
        this.total = data.total;
        this.loading = false;
      });
    },
    async getDelivery() {
      if (this.IdShop) {
        let url = `${this.url}/Orders?$expand=StockOrders&$filter=IdShop eq '${this.IdShop}'and CreatedAt eq ${this.DateOfIssueIdNumber}&$count=true`;
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
      }
      return { total: 0, items: [] };
    },
    // async getStockDelivery() {
    //   if (this.IdShop) {
    //     let url = `${this.url}/Orders?$expand=StockOrders&$filter=IdShop eq '${this.IdShop}'and StockOrders/any(x:x/CreatedAt eq ${this.DateOfIssueIdNumber})&$count=true`;
    //     let resp = await this.$stores.api.get(`${url}`);
    //     if (resp && resp.status == 200) {
    //       let data = await resp.json();
    //       let total = data["@odata.count"];
    //       return {
    //         total,
    //         items: data.value,
    //       };
    //     }
    //     return { total: 0, items: [] };
    //   }
    //   return { total: 0, items: [] };
    // },
    async getStockDelivery() {
      if (this.IdShop) {
        let url = `${this.url}/Orders?$expand=StockOrders&$filter=IdShop eq '${this.IdShop}'and StockOrders/any(x:x/DeletedAt eq ${this.DateOfIssueIdNumber})&$count=true`;
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
      }
      return { total: 0, items: [] };
    },
    formatdelayDate(date) {
      if (date.length) {
        return this.monentDate(
          new Date(date[0].Delaydate).toLocaleDateString()
        );
      }
    },
    sum(array, key) {
      return array.reduce(function(r, a) {
        return r + a[key];
      }, 0);
    },
    print() {
      window.print();
    },
    exportExcel() {
      const filterVal = [
        "Id",
        "CustomerName",
        "TheAddresss",
        "PhoneNumber",
        "Cod",
        "ShipFee",
        "RealReceive",
      ];
      const headerDisplay = [
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "COD",
        "Ship",
        "Tổng",
      ];
      const filterValDelay = [
        "Id",
        "CustomerName",
        "TheAddresss",
        "PhoneNumber",
        "Cod",
        "ShipFee",
        "StockOrders",
      ];
      const headerDisplayDalay = [
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "COD",
        "Ship",
        "Hoãn tới",
      ];

      const dataSuccess = this.formatJson(filterVal, this.OrdersSuccess);

      const newDataSuccess = [headerDisplay, ...dataSuccess];
      const dataHalf = this.formatJson(filterVal, this.OrdersHalf);
      const newDataHalf = [headerDisplay, ...dataHalf];
      const dataFail = this.formatJson(filterVal, this.OrdersFail);
      const newDataFail = [headerDisplay, ...dataFail];
      const dataDelay = this.formatJsonDelay(filterValDelay, this.OrdersDelay);

      const newDataDelay = [headerDisplayDalay, ...dataDelay];

      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(newDataSuccess),
        wsh = XLSX.utils.aoa_to_sheet(newDataHalf),
        wsd = XLSX.utils.aoa_to_sheet(newDataDelay),
        wsf = XLSX.utils.aoa_to_sheet(newDataFail);

      ws.font = { size: 13 };
      let wscols = [
        { wch: 20 },
        { wch: 15 },
        { wch: 40 },
        { wch: 10 },
        { wch: 5 },
        { wch: 5 },
        { wch: 15 },
      ];
      ws["!cols"] = wscols;
      wsh["!cols"] = wscols;
      wsd["!cols"] = wscols;
      wsf["!cols"] = wscols;
      XLSX.utils.book_append_sheet(wb, ws, "ThanhCong");
      XLSX.utils.book_append_sheet(wb, wsh, "ThanhCong1Phan");
      XLSX.utils.book_append_sheet(wb, wsd, "Hoan");
      XLSX.utils.book_append_sheet(wb, wsf, "Tra");
      XLSX.writeFile(wb, "ThongKeNhanVien.xlsx");
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
  #printed-content {
    visibility: visible;
    position: absolute;
    left: 0;
    top: 0;
  }
  #btnPrint {
    display: none;
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
