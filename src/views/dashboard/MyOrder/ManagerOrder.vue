<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" style="text-align: center;">
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
              style="width:40%;margin: 0 auto;"
              @blur="date = parseDate(dateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="DateOfIssueIdNumber"
            @input="menu = false"
          ></v-date-picker>
        </v-menu>
        <v-row>
          <v-col cols="4" class="inputDate">
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
          <v-col cols="4" class="inputDate">
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
          <v-col cols="4">
            <v-btn
              color="success"
              id="btnPrint"
              rounded
              style="float: left"
              class="mr-3"
              @click="filterGroupDate()"
            >
              Thống kê
            </v-btn>
          </v-col>
        </v-row>
        <v-btn
          color="success"
          rounded
          style="margin-left: 10px"
          class="mr-0 btnDelivery"
          @click="exportExcel()"
        >
          Xuất Excel
        </v-btn>
      </v-col>
      <v-row>
        <v-col cols="6">
          <div style="background-color:#1867c0;" class="statistical">
            <h1>Đơn hàng đã thanh toán: {{ countSucess }}</h1>
            <!-- <h1>Tổng phí Cod: {{ totalCodSucess }}</h1>
          <h1>Tổng phí Ship: {{ totalShipSucess }}</h1>
          <h1>Tổng phí ban đầu: {{ totalCodSucess + totalShipSucess }}</h1> -->
            <h1>Tổng phí đã trả: {{ totalRealSucess }}</h1>
          </div>
        </v-col>
        <v-col cols="6">
          <div style="background-color:#fb8c00;float:left" class="statistical">
            <h1>Đơn hàng chưa thanh toán: {{ countUnSucess }}</h1>
            <h1>Đơn hàng đã xong: {{ countRealUnSucess }}</h1>
            <!-- <h1>Tổng phí Cod: {{ totalCodUnSucess }}</h1>
          <h1>Tổng phí Ship: {{ totalShipUnSucess }}</h1>
          <h1>Tổng phí ban đầu: {{ totalCodUnSucess + totalShipUnSucess }}</h1> -->
            <h1>Tổng phí phải trả: {{ totalRealUnSucess }}</h1>
          </div>
        </v-col>
      </v-row>
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
                  v-model="search"
                  single-line
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
                <div v-if="item.RealReceive == null">
                  {{ formatNumber(item.ShipFee + item.Cod) }}
                </div>
                <div v-else>{{ formatNumber(item.RealReceive) }}</div>
              </template>
              <template v-slot:item.Status="{ item }">
                <template v-if="item.TheStatus == null || item.TheStatus == 0">
                  <v-btn dark color="teal">
                    Đang giao
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 1">
                  <v-btn color="success">
                    Thành công
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 2">
                  <v-btn color="error">
                    Trả hàng
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 3">
                  <v-btn color="warning">
                    Tồn kho
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 4">
                  <v-btn color="#5cbbf6">
                    Hoàn thành 1 phần
                  </v-btn>
                </template>
              </template>
              <template v-slot:item.Action="{ item }">
                <template v-if="item.IsSuccess == null || item.IsSuccess == 0">
                  <v-btn color="warning" @click="SaveModal(item, 1)">
                    Chưa thanh toán
                  </v-btn>
                </template>
                <template v-if="item.IsSuccess == 1">
                  <v-btn color="#1867c0" @click="SaveModal(item, 0)">
                    Đã thanh toán
                  </v-btn>
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
  </v-container>
</template>

<script>
import moment from "moment";
import XLSX from "xlsx";

export default {
  metaInfo: {
    title: "Quan Ly Don Hang",
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
        this.filterGroupDate();
      },
      deep: true,
    },
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
      this.getDataFromApi();
    },
    IdShop(val) {
      this.getDataFromApi();
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
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
      IdShop: "",
      pageCount: 0,
      options: {},
      total: 0,
      IdOrder: "",
      search: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      FromDate: new Date().toISOString().substr(0, 10),
      fromDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      ToDate: new Date().toISOString().substr(0, 10),
      toDate: this.formatDate(new Date().toISOString().substr(0, 10)),
      menuFrom: false,
      menuTo: false,
      menu: false,
      isShow: false,
      Show: false,
      loading: true,
      Shop: [],
      Orders: [],
      IdKey: "",
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
        { text: "Tổng thu", value: "Sum" },
        { text: "Trạng thái giao", value: "Status" },
        { text: "Trạng thái", value: "Action" },
      ],
      // StateSelected: 0,
      // States: [
      //   { Id: "0", Name: "Chưa thanh toán" },
      //   { Id: "1", Name: "Đã thanh toán" },
      // ],
      totalCodSucess: 0,
      totalShipSucess: 0,
      totalCodUnSucess: 0,
      totalShipUnSucess: 0,
      totalRealSucess: 0,
      totalRealUnSucess: 0,
      countSucess: 0,
      countRealUnSucess: 0,
      countUnSucess: 0,
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
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    async SaveModal(item, sucess) {
      let state = {};
      state.IsSuccess = sucess;
      let key = item.Id;
      let url = `${this.url}/Orders/${key}`;
      let order = this.Orders.filter((_) => _.Id == key.toString());
      if (order[0].TheStatus) {
        let resp = await this.$stores.api.patch(`${url}`, state);
        if (resp && resp.status == 200) {
          alert("Updated successfully.");
          this.Show = false;
          this.getDataFromApi();
        } else {
          alert("Updated failed.");
        }
      } else {
        alert("Đơn hàng đang giao");
      }
    },
    getDataFromApi() {
      this.loading = true;
      this.fakeApiCall().then((data) => {
        this.Orders = data.items;
        this.total = data.total;
        this.countSucess = data.items.filter((_) => _.IsSuccess == 1).length;
        this.countUnSucess = data.items.filter((_) => _.IsSuccess == 0).length;
        this.countRealUnSucess = data.items.filter(
          (_) => _.IsSuccess == 0 && _.RealReceive != null
        ).length;
        this.totalRealSucess = this.sum(
          data.items.filter((_) => _.IsSuccess == 1),
          "RealReceive"
        );
        this.totalRealUnSucess = this.sum(
          data.items.filter((_) => _.IsSuccess == 0),
          "RealReceive"
        );
        this.loading = false;
      });
    },
    async fakeApiCall() {
      const { sortBy, page, itemsPerPage } = this.options;
      const search = this.search;
      let data = await this.getOrders(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getOrders(page, itemsPerPage, search) {
      let top = "";
      let skip = "";
      if (this.IdShop) {
        if (itemsPerPage > 0) {
          top = `&$top=${itemsPerPage}`;
          skip = `&$skip=${(page - 1) * itemsPerPage}`;
        }
        let filter = search && ` and contains(Id, '${search}')`;
        let url = `${this.url}/Orders?$filter=IdShop eq '${this.IdShop}'and CreatedAt eq ${this.DateOfIssueIdNumber}${filter}&$count=true${top}${skip}`;
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

    filterGroupDate() {
      this.fakeApiCallDate().then((data) => {
        this.Orders = data.items;
        this.total = data.total;
        this.countSucess = data.items.filter((_) => _.IsSuccess == 1).length;
        this.countUnSucess = data.items.filter((_) => _.IsSuccess == 0).length;
        this.countRealUnSucess = data.items.filter(
          (_) => _.IsSuccess == 0 && _.RealReceive != null
        ).length;
        this.totalRealSucess = this.sum(
          data.items.filter((_) => _.IsSuccess == 1),
          "RealReceive"
        );
        this.totalRealUnSucess = this.sum(
          data.items.filter((_) => _.IsSuccess == 0),
          "RealReceive"
        );
        this.loading = false;
      });
    },
    async fakeApiCallDate() {
      const { sortBy, page, itemsPerPage } = this.options;
      const search = this.search;
      let data = await this.getDeliveryDate(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getDeliveryDate(page, itemsPerPage, search) {
      let top = "";
      let skip = "";
      if (this.IdShop) {
        if (itemsPerPage > 0) {
          top = `&$top=${itemsPerPage}`;
          skip = `&$skip=${(page - 1) * itemsPerPage}`;
        }
        let filter = search && ` and contains(Id, '${search}')`;
        let url = `${this.url}/Orders?$filter=IdShop eq '${this.IdShop}'and CreatedAt ge ${this.FromDate} and CreatedAt le ${this.ToDate}&$count=true${top}${skip}`;
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
    sum(array, key) {
      return array.reduce(function(r, a) {
        return r + a[key];
      }, 0);
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
          Number: jsonData.findIndex((v) => v.Id == _.Id) + 1,
          Id: v.Id,
          CustomerName: v.CustomerName,
          TheAddress: v.TheAddress,
          PhoneNumber: v.PhoneNumber,
          Sum:
            v.RealReceive == null
              ? v.Cod + v.ShipFee > 0
                ? v.Cod + v.ShipFee
                : 0
              : v.RealReceive,
          Status:
            v.TheStatus == 0 || v.TheStatus == null
              ? "Đang Giao"
              : v.TheStatus == 1
              ? "Thành Công"
              : v.TheStatus == 2
              ? "Trả hàng"
              : v.TheStatus == 3
              ? "Tồn kho"
              : "Hoàn thành 1 phần",
          StatusShop: v.IsSuccess == 0 ? "Chưa thanh toán" : "Đã thanh toán",
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
        "TheAddress",
        "PhoneNumber",
        "Sum",
        "Status",
        "StatusShop",
      ];
      const headerDisplay = [
        "Stt",
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "Tổng thu",
        "Trạng thái giao",
        "Trạng thái thanh toán",
      ];

      const Name = this.Shop.filter((_) => _.Id == this.IdShop).map(
        (_) => _.Name
      );
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
        { wch: 20 },
        { wch: 15 },
        { wch: 40 },
        { wch: 10 },
        { wch: 10 },
        { wch: 20 },
        { wch: 20 },
      ];
      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "DonHangGiao");

      XLSX.writeFile(wb, "QuanLyDonHangShop.xlsx");
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
.statistical {
  float: right;
  align-items: center;
  color: inherit;
  justify-content: inherit;
  line-height: normal;
  position: relative;
  transition: inherit;
  transition-property: opacity;
  color: #fff;
  margin-bottom: 2px;
  font-size: 1rem;
  border-radius: 4px;
  padding: 5px 20px;
}
.v-btn {
  width: 10rem;
}
</style>
