<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row id="table">
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
          rounded
          class="mr-0"
          @click="(isShow = true), (objAddOrder = {}), (IdProvince = [])"
        >
          Thêm
        </v-btn>
        <v-btn
          color="success"
          style="margin-left: 10px"
          rounded
          class="mr-0"
          @click="PrintCode()"
        >
          In tất cả Mã
        </v-btn>
        <v-btn
          color="success"
          style="margin-left: 10px"
          rounded
          class="mr-0"
          @click="exportExcel()"
        >
          Xuất excel
        </v-btn>
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
                <div>{{ formatNumber(item.ShipFee + item.Cod) }}</div>
              </template>
              <template v-slot:item.Action="{ item }">
                <div class="text-left">
                  <i
                    aria-hidden="true"
                    style="cursor: pointer;"
                    class="v-icon notranslate mdi mdi-cloud-print"
                    @click="PrintOne(item.Id)"
                  ></i>
                  <i
                    aria-hidden="true"
                    class="v-icon notranslate mdi mdi-pencil-plus"
                    style="margin-left: 10px;cursor: pointer;"
                    @click="
                      (isShowUp = true),
                        (objAddOrder = item),
                        (IdOrder = item.Id)
                    "
                  ></i>
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
    <input-detail
      :IdProvince="IdProvince"
      :isShow="isShow"
      @update="
        (e) => {
          SaveModal(e);
        }
      "
      @close="isShow = false"
    />
    <input-detail
      :user="objAddOrder"
      :IdProvince="IdProvince"
      :isShow="isShowUp"
      @update="
        (e) => {
          changeInfo(e);
        }
      "
      @close="isShowUp = false"
    />
    <div :id="`${printOne && !printAll ? 'print-One' : ''}`" class="hidePrint">
      <VueBarcode
        v-bind:options="{
          lineColor: '#0275d8',
          text: 'Scan',
          format: 'CODE39',
        }"
        v-bind:value="IdOrder"
      />
    </div>
    <div :id="`${printAll && !printOne ? 'print-All' : ''}`" class="hidePrint">
      <span v-for="(item, i) in Orders" :key="i">
        <div style="border: 1px solid;margin-top:0.3rem">
          <div style="text-align:center">Họ tên: {{ item.CustomerName }}</div>
          <div style="text-align:center">
            Số điện thoại: {{ item.PhoneNumber }}
          </div>
          <div style="text-align:center">Địa chỉ: {{ item.TheAddress }}</div>
          <div style="text-align:center">Cod: {{ item.Cod }}</div>
          <div style="text-align:center">Ship: {{ item.ShipFee }}</div>
          <div style="text-align:center">
            Tổng phí: {{ item.ShipFee + item.Cod }}
          </div>
          <div style="text-align:center">
            <VueBarcode
              v-bind:options="{ lineColor: '#0275d8', text: 'Scan' }"
              v-bind:value="item.Id"
            />
          </div>
        </div>
        <div class="pagebreak"></div>
      </span>
    </div>
    <my-Modal :show="Show" :title="'In mã'" @close="Show = false">
      <v-col cols="12" style="text-align: center">
        Bạn có chắc muốn in ?
      </v-col>
      <template v-slot:m-foot>
        <v-btn color="blue darken-1" text @click="btnPrint()">
          In
        </v-btn>
      </template>
    </my-Modal>
  </v-container>
</template>

<script>
import InputDetail from "../Inputcomponents/InputOrderDetail.vue";
import moment from "moment";
import VueBarcode from "vue-barcode";
import myModal from "../components/Modal.vue";
import Datepicker from "vuejs-datepicker";
import { vi } from "vuejs-datepicker/dist/locale";
import XLSX from "xlsx";

export default {
  metaInfo: {
    title: "Tao Don Hang",
  },
  components: { InputDetail, VueBarcode, myModal },
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
    search: {
      handler(val) {
        this.getDataFromApi();
      },
    },
  },
  data() {
    return {
      vi: vi,
      IdShop: "",
      pageCount: 0,
      options: {},
      total: 0,
      IdOrder: "",
      allId: [],
      printOne: false,
      search: "",
      printAll: false,
      IdProvince: null,
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      menu: false,
      isShow: false,
      Show: false,
      isShowUp: false,
      loading: true,
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
        { text: "Tác vụ", value: "Action" },
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
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    async SaveModal(e) {
      if (!this.IdShop) {
        alert("Tên shop không được để trống");
        return;
      }
      if (!e) {
        alert("Bạn phải nhập đủ thông tin");
        return;
      }
      this.objAddOrder = e;
      this.objAddOrder.IdShop = this.IdShop;
      let objAddOrder = this.objAddOrder;
      let url = `${this.url}/Orders`;
      let resp = await this.$stores.api.post(`${url}`, objAddOrder);
      if (resp && resp.status == 200) {
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
        this.allId = data.items.map((_) => _.Id);
        this.total = data.total;
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
        let url = `${this.url}/Orders?$filter=IdShop eq '${this.IdShop}' and CreatedAt eq ${this.DateOfIssueIdNumber}${filter}&$count=true${top}${skip}`;
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
    formatNumber(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    PrintCode() {
      this.printAll = true;
      this.printOne = false;
      this.Show = true;
    },

    PrintOne(item) {
      this.IdOrder = item;
      this.printAll = false;
      this.printOne = true;
      this.Show = true;
    },
    btnPrint() {
      window.print();
      this.Show = false;
    },
    async changeInfo(e) {
      this.objAddOrder = e;
      this.objAddOrder.IdShop = this.IdShop;
      let objAddOrder = this.objAddOrder;
      let url = `${this.url}/Orders/${this.IdOrder}`;
      let resp = await this.$stores.api.patch(`${url}`, objAddOrder);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.isShowUp = false;
        this.getDataFromApi();
      } else {
        alert("Updated failed.");
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    exportExcel() {
      const filterVal = [
        "Id",
        "CustomerName",
        "TheAddress",
        "PhoneNumber",
        "Cod",
        "ShipFee",
      ];
      const headerDisplay = [
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "COD",
        "Ship",
      ];

      const Name = this.Shop.filter((_) => _.Id == this.IdShop).map(
        (_) => _.Name
      );
      Name.push(this.dateFormatted);

      const dataSuccess = this.formatJson(filterVal, this.Orders);
      const successData = [headerDisplay, ...dataSuccess];
      const newDataSuccess = [Name, ...successData];

      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(newDataSuccess);

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

      XLSX.utils.book_append_sheet(wb, ws, "DonHang");

      XLSX.writeFile(wb, "DonHangShop.xlsx");
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
.hidePrint {
  display: none;
}
@media print {
  @page {
    size: A5;
  }
  header,
  nav,
  footer {
    display: none;
  }
  body {
    visibility: hidden;
  }
  #print-One {
    visibility: visible;
    // position: absolute;
    display: block !important;
    top: 0;
  }
  #print-All {
    visibility: visible;
    // position: absolute;
    display: block !important;
    top: 0;
  }
  .v-dialog:not(.v-dialog--fullscreen) {
    max-width: 100%;
  }
  svg {
    width: 60%;
  }
  header {
    left: 0;
  }
  .v-main {
    padding: 75px 0px 0px !important;
  }
  #table {
    display: none;
  }
  .v-card__text {
    width: 100vw;
    height: 100vh;
  }
  .pagebreak {
    page-break-after: always;
  }
  #table {
    display: none;
  }
}
</style>
