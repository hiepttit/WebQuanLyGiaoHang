<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row id="printed-content">
      <v-col cols="12" style="text-align: center;">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Users"
          v-model="IdStaff"
          label="Tên nhân viên*"
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
      <template v-if="OrdersSuccessStock.length">
        <tableStatic
          :list="OrdersSuccessStock"
          :number="OrdersSuccessStock.length"
          :total="totalSuccessStock"
          :stock="true"
          :header="'Đơn hàng tồn kho đã hoàn thành'"
          :detail="'Danh sách tất cả đơn hàng tồn kho đã hoàn thành'"
          :color="'#1867c0'"
          :isStaff="true"
        />
      </template>
      <template v-if="OrdersSuccess.length">
        <tableStatic
          :list="OrdersSuccess"
          :number="OrdersSuccess.length"
          :total="totalSuccess"
          :header="'Đơn hàng thành công'"
          :detail="'Danh sách tất cả đơn hàng thành công'"
          :color="'success'"
          :isStaff="true"
        />
      </template>
      <template v-if="OrdersFail.length">
        <tableStatic
          :list="OrdersFail"
          :number="OrdersFail.length"
          :total="totalFail"
          :header="'Đơn hàng trả'"
          :detail="'Danh sách tất cả đơn hàng trả'"
          :color="'error'"
          :isStaff="true"
        />
      </template>
      <template v-if="OrdersDelay.length">
        <tableStatic
          :list="OrdersDelay"
          :number="OrdersDelay.length"
          :total="totalDelay"
          :header="'Đơn hàng hoãn'"
          :detail="'Danh sách tất cả đơn hàng hoãn'"
          :color="'warning'"
          :delay="true"
          :isStaff="true"
        />
      </template>
      <template v-if="OrdersHalf.length">
        <tableStatic
          :list="OrdersHalf"
          :number="OrdersHalf.length"
          :total="totalHalf"
          :header="'Đơn hàng thành công một phần'"
          :detail="'Danh sách tất cả đơn hàng thành công 1 phần'"
          :color="'#5cbbf6'"
          :isStaff="true"
        />
      </template>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import tableStatic from "./TableStatistical";
import XLSX from "xlsx";
export default {
  components: { tableStatic },
  metaInfo: {
    title: "Thong Ke Nhan Vien",
  },
  data() {
    return {
      total: 0,
      IdStaff: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      FromDate: new Date().toISOString().substr(0, 10),
      fromDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      ToDate: new Date().toISOString().substr(0, 10),
      toDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      menuFrom: false,
      menuTo: false,
      Users: [],
      OrdersSuccess: [],
      OrdersSuccessStock: [],
      OrdersDelay: [],
      OrdersFail: [],
      OrdersHalf: [],
      totalSuccess: 0,
      totalDelay: 0,
      totalFail: 0,
      totalHalf: 0,
      totalSuccessStock: 0,
      Receive: 0,
      url: "http://localhost:60189/odata",
    };
  },
  async mounted() {
    this.Users = await this.getUser();
    this.getDataFromApi();
  },
  watch: {
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
    IdStaff(val) {
      this.getDataFromApi();
    },
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
      this.loading = true;
      this.getDelivery().then((data) => {
        this.OrdersSuccess = data.items.filter((_) => _.TheStatus == 1);
        this.OrdersFail = data.items.filter((_) => _.TheStatus == 2);
        this.OrdersHalf = data.items.filter((_) => _.TheStatus == 4);
        this.total = data.total;
        this.totalSuccess = this.sum(
          data.items.filter((_) => _.TheStatus == 1),
          "RealReceive"
        );
        this.totalFail = this.sum(
          data.items.filter((_) => _.TheStatus == 2),
          "RealReceive"
        );
        this.totalHalf = this.sum(
          data.items.filter((_) => _.TheStatus == 4),
          "RealReceive"
        );
        this.loading = false;
      });
      this.getStockOrder().then((data) => {
        this.OrdersDelay = data.items.filter((_) => _.IsInStock == 1);
        this.total = data.total;
        this.totalDelay = this.sum(
          data.items.filter((_) => _.IsInStock == 1),
          "RealReceive"
        );
        this.loading = false;
      });
      this.getSuccessStockOrder().then((data) => {
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
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and CreatedAt eq ${this.DateOfIssueIdNumber}&$count=true`;
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
    async getStockOrder() {
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and StockOrders/any(x:x/Id ne null) and CreatedAt eq ${this.DateOfIssueIdNumber} &$count=true`;
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
    async getSuccessStockOrder() {
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/DeletedAt eq ${this.DateOfIssueIdNumber}) &$count=true`;
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
    async getDelayDate(idOrder) {
      let resp = await this.$stores.api.get(
        `${this.url}/StockOrders?$select=Delaydate&$filter=IdTheOrder eq '${idOrder}'`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
    },
    async filterGroupDate() {
      this.loading = true;
      this.getDeliveryDate().then((data) => {
        this.OrdersSuccess = data.items.filter((_) => _.TheStatus == 1);
        this.OrdersFail = data.items.filter((_) => _.TheStatus == 2);
        this.OrdersHalf = data.items.filter((_) => _.TheStatus == 4);
        this.total = data.total;
        this.totalSuccess = this.sum(
          data.items.filter((_) => _.TheStatus == 1),
          "RealReceive"
        );
        this.totalFail = this.sum(
          data.items.filter((_) => _.TheStatus == 2),
          "RealReceive"
        );
        this.totalHalf = this.sum(
          data.items.filter((_) => _.TheStatus == 4),
          "RealReceive"
        );
        this.loading = false;
      });
      this.getStockOrderDate().then((data) => {
        this.OrdersDelay = data.items.filter((_) => _.IsInStock == 1);
        this.total = data.total;
        this.totalDelay = this.sum(
          data.items.filter((_) => _.IsInStock == 1),
          "RealReceive"
        );
        this.loading = false;
      });
      this.getSuccessStockOrderDate().then((data) => {
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
    async getDeliveryDate() {
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and CreatedAt ge ${this.FromDate} and CreatedAt le ${this.ToDate}&$count=true`;
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
    async getStockOrderDate() {
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/CreatedAt ge ${this.FromDate}) and StockOrders/any(x:x/CreatedAt le ${this.ToDate})&$count=true`;
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
    async getSuccessStockOrderDate() {
      if (this.IdStaff) {
        let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/DeletedAt ge ${this.FromDate}) and StockOrders/any(x:x/DeletedAt le ${this.ToDate})&$count=true`;
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
    formatJson(filterVal, jsonData) {
      let data = jsonData.map((_) => {
        return {
          Number: jsonData.findIndex((v) => v.Id == _.Id) + 1,
          Id: _.Id,
          CustomerName: _.CustomerName,
          TheAddress: _.TheAddress,
          PhoneNumber: _.PhoneNumber,
          Cod: _.Cod,
          ShipFee: _.ShipFee,
          Sum: _.RealReceive && _.RealReceive > 0 ? _.RealReceive : 0,
          Amount: _.DeliveryOrders[0].Amount,
        };
      });
      return data.map((v) => filterVal.map((j) => v[j]));
    },
    formatJsonDelay(filterVal, jsonData) {
      let temp = [];
      let data = jsonData.map((_) => {
        return {
          Number: jsonData.findIndex((v) => v.Id == _.Id) + 1,
          Id: _.Id,
          CustomerName: _.CustomerName,
          TheAddress: _.TheAddress,
          PhoneNumber: _.PhoneNumber,
          Cod: _.Cod,
          ShipFee: _.ShipFee,
          Amount: _.DeliveryOrders[0].Amount,
          StockOrders: _.StockOrders,
        };
      });
      data.map((v) =>
        filterVal.map((j) => {
          if (j != "StockOrders") {
            temp.push(v[j]);
          } else {
            temp.push(this.formatdelayDate(v[j]));
          }
        })
      );
      return [temp];
    },
    exportExcel() {
      const filterVal = [
        "Number",
        "Id",
        "CustomerName",
        "TheAddress",
        "PhoneNumber",
        "ShipFee",
        "Cod",
        "Sum",
        "Amount",
      ];
      const headerDisplay = [
        "Stt",
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "Ship",
        "Cod",
        "Tổng thu",
        "Lương",
      ];
      const filterValDelay = [
        "Number",
        "Id",
        "CustomerName",
        "TheAddress",
        "PhoneNumber",
        "ShipFee",
        "Cod",
        "StockOrders",
      ];
      const headerDisplayDalay = [
        "Stt",
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "Ship",
        "Cod",
        "Lương",
      ];
      const Name = this.Users.filter((_) => _.Id == this.IdStaff).map(
        (_) => _.Name
      );
      Name.push(this.dateFormatted);
      Name.push("Từ ngày:" + this.fromDate);
      Name.push("Tới ngày:" + this.toDate);

      const dataSuccessInStock = this.formatJson(
        filterVal,
        this.OrdersSuccessStock
      );
      const successInStockData = [headerDisplay, ...dataSuccessInStock];
      const newDataSuccessInStock = [Name, ...successInStockData];

      const dataSuccess = this.formatJson(filterVal, this.OrdersSuccess);
      const successData = [headerDisplay, ...dataSuccess];
      const newDataSuccess = [Name, ...successData];

      const dataHalf = this.formatJson(filterVal, this.OrdersHalf);
      const HalfData = [headerDisplay, ...dataHalf];
      const newDataHalf = [Name, ...HalfData];

      const dataFail = this.formatJson(filterVal, this.OrdersFail);
      const FailData = [headerDisplay, ...dataFail];
      const newDataFail = [Name, ...FailData];

      const dataDelay = this.formatJsonDelay(filterValDelay, this.OrdersDelay);
      const DelayData = [headerDisplayDalay, ...dataDelay];
      const newDataDelay = [Name, ...DelayData];

      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(newDataSuccess),
        wst = XLSX.utils.aoa_to_sheet(newDataSuccessInStock),
        wsh = XLSX.utils.aoa_to_sheet(newDataHalf),
        wsd = XLSX.utils.aoa_to_sheet(newDataDelay),
        wsf = XLSX.utils.aoa_to_sheet(newDataFail);

      ws.font = { size: 13 };
      let wscols = [
        { wch: 5 },
        { wch: 20 },
        { wch: 15 },
        { wch: 40 },
        { wch: 20 },
        { wch: 5 },
        { wch: 5 },
        { wch: 5 },
        { wch: 5 },
      ];
      ws["!cols"] = wscols;
      wst["!cols"] = wscols;
      wsh["!cols"] = wscols;
      wsd["!cols"] = wscols;
      wsf["!cols"] = wscols;
      XLSX.utils.book_append_sheet(wb, ws, "ThanhCong");
      XLSX.utils.book_append_sheet(wb, wst, "ThanhCongKho");
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
  .inputDate {
    display: none;
  }
}
</style>
