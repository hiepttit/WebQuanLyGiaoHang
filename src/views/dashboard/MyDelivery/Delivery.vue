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
        <v-btn
          color="success"
          rounded
          class="mr-0 btnDelivery"
          @click="
            Show = true;
            hasStock = false;
            IdTheOrder = [];
          "
        >
          Giao hàng
        </v-btn>
        <v-btn
          v-if="CodeInStock.length"
          color="warning"
          rounded
          style="margin-left: 10px"
          class="mr-0 btnDelivery"
          @click="
            Show = true;
            hasStock = true;
            IdInStock = [];
          "
        >
          Giao đơn tồn kho
        </v-btn>
        <v-btn
          color="success"
          rounded
          style="margin-left: 10px"
          class="mr-0 btnDelivery"
          @click="exportExcel()"
        >
          Xuất Excel
        </v-btn>
        <v-btn
          color="success"
          rounded
          class="mr-0 btnDelivery"
          style="margin-left: 10px"
          @click="print()"
        >
          <i
            aria-hidden="true"
            class="v-icon notranslate mdi mdi-cloud-print"
            style="margin-right:10px"
          ></i>
          In
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
                  single-line
                  hide-details
                  v-model="search"
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
                <template v-if="item.ShipFee + item.Cod > 0">
                  <div>{{ formatNumber(item.ShipFee + item.Cod) }}</div>
                </template>
                <template v-else>
                  <div>0</div>
                </template>
              </template>
              <template v-slot:item.Action="{ item }">
                <div v-if="item.TheStatus == 0" class="text-left">
                  <v-btn
                    color="warning"
                    rounded
                    class="mr-0"
                    @click="(isShow = true), (IdOrder = item.Id)"
                  >
                    Đổi người
                  </v-btn>
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
      <template v-if="check.length">
        <v-col cols="12" md="12">
          <StockTable
            :IdUser="IdStaff"
            :DateOfIssueIdNumber="DateOfIssueIdNumber"
            :isCreate="true"
            @stockOrder="
              (e) => {
                stockOrders = e;
              }
            "
          ></StockTable>
        </v-col>
      </template>
    </v-row>
    <my-Modal :show="Show" :title="'THÊM ĐƠN GIAO HÀNG'" @close="Show = false">
      <v-col v-if="!hasStock" cols="12">
        <v-combobox
          item-text="id"
          item-value="id"
          v-model="IdTheOrder"
          :items="Code"
          label="Chọn mã:"
          multiple
          chips
        >
          <template v-slot:selection="data">
            <template v-if="data.item.id">
              <v-chip
                :key="JSON.stringify(data.item.id)"
                v-bind="data.attrs"
                :input-value="data.selected"
                :disabled="data.disabled"
                @click:close="data.parent.selectItem(data.item.id)"
              >
                {{ data.item.id }}
              </v-chip>
            </template>
          </template>
        </v-combobox>
      </v-col>
      <template v-else-if="CodeInStock.length">
        <v-col cols="12">
          <v-combobox
            item-text="id"
            v-model="IdInStock"
            :items="CodeInStock"
            label="Hàng tồn kho:"
            multiple
            chips
          >
            <template v-slot:selection="data">
              <template v-if="data.item.id">
                <v-chip
                  :key="JSON.stringify(data.item.id)"
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  :disabled="data.disabled"
                  @click:close="data.parent.selectItem(data.item.id)"
                >
                  {{ data.item.id }}
                </v-chip>
              </template>
            </template>
          </v-combobox>
        </v-col>
      </template>

      <template v-slot:m-foot>
        <v-btn
          v-if="CodeInStock.length && hasStock"
          depressed
          color="warning"
          @click="DeliveryInStock()"
        >
          Ok
        </v-btn>
        <v-btn v-else depressed color="primary" @click="SaveModal()">
          Ok
        </v-btn>
      </template>
    </my-Modal>
    <my-Modal
      :show="isShow"
      :title="'ĐỔI NGƯỜI VẬN CHUYỂN'"
      @close="isShow = false"
    >
      <v-col cols="12">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Users.filter((_) => _.Id != IdStaff)"
          v-model="IdNewStaff"
          label="Chọn nhân viên*"
          :rules="[(v) => !!v || 'Item is required']"
          required
          style="width:40%;margin: 0 auto;"
        ></v-select>
      </v-col>
      <template v-slot:m-foot>
        <v-btn depressed color="warning" @click="changeStaff()">
          Ok
        </v-btn>
      </template>
    </my-Modal>
  </v-container>
</template>

<script>
import moment from "moment";
import myModal from "../components/Modal.vue";
import XLSX from "xlsx";
import StockTable from "./MangerStock.vue";

export default {
  metaInfo: {
    title: "Tao Giao Hang",
  },
  components: { myModal, StockTable },
  data() {
    return {
      pageCount: 0,
      options: {},
      total: 0,
      IdStaff: "",
      IdNewStaff: "",
      IdOrder: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      menu: false,
      Show: false,
      isShow: false,
      loading: true,
      hasStock: false,
      Users: [],
      Orders: [],
      stockOrders: [],
      Receive: 0,
      objAddDelivery: {},
      url: "http://localhost:60189/odata",
      headers: [
        { text: "Stt", align: "center", sortable: false, value: "Stt" },
        { text: "Mã", align: "start", sortable: false, value: "Id" },
        { text: "Tên khách hàng", align: "start", value: "CustomerName" },
        { text: "Địa chỉ", value: "TheAddress", align: "left" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        { text: "COD", value: "Cod" },
        { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
        { text: "Tác vụ", value: "Action" },
      ],
      Code: [],
      IdTheOrder: [],
      CodeInStock: [],
      IdInStock: [],
      check: [],
      search: "",
      preSalary: [],
    };
  },
  async mounted() {
    this.Users = await this.getUser();
    this.Code = await this.getIdFromOrder();
    this.CodeInStock = await this.getIdFromStockOrder();
    this.getDataFromApi();
    this.preSalary = await this.getSalary();
  },
  computed: {
    salary() {
      if (this.preSalary.length) {
        let sa = this.preSalary[0];
        return sa.Salary;
      }
      return 0;
    },
  },
  watch: {
    options: {
      immediate: false,
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    async DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
      this.check = await this.checkInStock();
      this.getDataFromApi();
    },
    DateOfIssueIdNumberModal(val) {
      this.dateFormattedModal = this.formatDate(this.DateOfIssueIdNumberModal);
    },
    async IdStaff(val) {
      this.check = await this.checkInStock();
      this.getDataFromApi();
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
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
    async SaveModal() {
      let code = this.Code.map((_) => _.id);
      if (!this.IdStaff) {
        alert("Tên nhân viên không được để trống");
        return;
      }
      this.objAddDelivery.IdStaff = this.IdStaff;
      let objAddDelivery = this.objAddDelivery;
      let url = `${this.url}/DeliveryOrders`;
      let preArr = [...new Set(this.IdTheOrder)];
      let arr = preArr.filter((_) => typeof _ !== "string");
      if (arr.length) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id) {
            if (code.includes(arr[i].id)) {
              objAddDelivery.IdTheOrder = arr[i].id;
              objAddDelivery.Coefficient = arr[i].coefficient;
              if (this.salary != 0) {
                objAddDelivery.Amount = (
                  arr[i].coefficient * this.salary
                ).toFixed(2);
              }

              let resp = await this.$stores.api.post(`${url}`, objAddDelivery);
              if (resp && resp.status == 200 && i == arr.length - 1) {
                alert("Updated successfully.");
                this.Show = false;
                this.getDataFromApi();
                this.Code = await this.getIdFromOrder();
              } else {
                if (i == arr.length - 1) {
                  alert("Updated failed.");
                }
              }
            } else {
              alert("Mã không tồn tại !");
              return;
            }
          } else {
            if (code.includes(arr[i])) {
              objAddDelivery.IdTheOrder = arr[i];
              let arrOrder = this.Code.find((_) => _.id == arr[i]);
              objAddDelivery.Coefficient = arrOrder.coefficient;
              if (this.salary != 0) {
                objAddDelivery.Amount = (
                  arrOrder.coefficient * this.salary
                ).toFixed(2);
              }

              let resp = await this.$stores.api.post(`${url}`, objAddDelivery);
              if (resp && resp.status == 200 && i == arr.length - 1) {
                alert("Updated successfully.");
                this.Show = false;
                this.getDataFromApi();
                this.Code = await this.getIdFromOrder();
              } else {
                if (i == arr.length - 1) {
                  alert("Updated failed.");
                }
              }
            } else {
              alert("Mã không tồn tại !");
              return;
            }
          }
        }
      } else {
        alert("Mã sai chọn lại !");
      }
    },
    //  async DeliveryInStock() {
    //   if (!this.IdStaff) {
    //     alert("Tên nhân viên không được để trống");
    //     return;
    //   }
    //   this.objAddDelivery.IdStaff = this.IdStaff;
    //   let objAddDelivery = this.objAddDelivery;
    //   let url = `${this.url}/DeliveryOrders`;
    //   let arr = this.IdInStock;
    //   let id = "";
    //   for (var i = 0; i < arr.length; i++) {
    //     objAddDelivery.TheStatus = 0;
    //     if (arr[i].id) {
    //       id = arr[i].id;
    //     } else id = arr[i];
    //     let resp = await this.$stores.api.patch(`${url}/${id}`, objAddDelivery);
    //     if (resp && resp.status == 200 && i == arr.length - 1) {
    //       alert("Updated successfully.");
    //       this.Show = false;
    //       this.getDataFromApi();
    //       this.Code = await this.getIdFromOrder();
    //       this.check = await this.checkInStock();
    //       this.CodeInStock = await this.getIdFromStockOrder();
    //     } else {
    //       if (i == arr.length - 1) {
    //         alert("Updated failed.");
    //       }
    //     }
    //   }
    // },
    async DeliveryInStock() {
      let code = this.CodeInStock.map((_) => _.id);
      if (!this.IdStaff) {
        alert("Tên nhân viên không được để trống");
        return;
      }
      this.objAddDelivery.IdStaff = this.IdStaff;
      let objAddDelivery = this.objAddDelivery;
      let url = `${this.url}/DeliveryOrders`;
      let preArr = [...new Set(this.IdInStock)];
      let arr = preArr.filter((_) => typeof _ !== "string");

      if (arr.length) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id) {
            if (code.includes(arr[i].id)) {
              objAddDelivery.IdTheOrder = arr[i].id;
              objAddDelivery.Coefficient = arr[i].coefficient;
              if (this.salary != 0) {
                objAddDelivery.Amount = (
                  arr[i].coefficient * this.salary
                ).toFixed(2);
              }

              let resp = await this.$stores.api.patch(
                `${url}/${id}`,
                objAddDelivery
              );
              if (resp && resp.status == 200 && i == arr.length - 1) {
                alert("Updated successfully.");
                this.Show = false;
                this.getDataFromApi();
                this.Code = await this.getIdFromOrder();
              } else {
                if (i == arr.length - 1) {
                  alert("Updated failed.");
                }
              }
            } else {
              alert("Mã không tồn tại !");
              return;
            }
          } else {
            if (code.includes(arr[i])) {
              objAddDelivery.IdTheOrder = arr[i];
              let arrOrder = this.Code.find((_) => _.id == arr[i]);
              objAddDelivery.Coefficient = arrOrder.coefficient;
              if (this.salary != 0) {
                objAddDelivery.Amount = (
                  arrOrder.coefficient * this.salary
                ).toFixed(2);
              }

              let resp = await this.$stores.api.patch(
                `${url}/${id}`,
                objAddDelivery
              );
              if (resp && resp.status == 200 && i == arr.length - 1) {
                alert("Updated successfully.");
                this.Show = false;
                this.getDataFromApi();
                this.Code = await this.getIdFromOrder();
              } else {
                if (i == arr.length - 1) {
                  alert("Updated failed.");
                }
              }
            } else {
              alert("Mã không tồn tại !");
              return;
            }
          }
        }
      } else {
        alert("Mã sai chọn lại !");
      }
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
    async changeStaff() {
      let obj = {};
      obj.IdStaff = this.IdNewStaff;
      let url = `${this.url}/DeliveryOrders`;
      let resp = await this.$stores.api.patch(`${url}/${this.IdOrder}`, obj);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.isShow = false;
        this.getDataFromApi();
        this.Code = await this.getIdFromOrder();
        this.check = await this.checkInStock();
        this.CodeInStock = await this.getIdFromStockOrder();
      } else {
        if (i == arr.length - 1) {
          alert("Updated failed.");
        }
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
      const search = this.search;
      let data = await this.getDelivery(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getDelivery(page, itemsPerPage, search) {
      let top = "";
      let skip = "";
      let filter = search && ` and contains(Id, '${search}')`;
      if (this.IdStaff) {
        if (itemsPerPage > 0) {
          top = `&$top=${itemsPerPage}`;
          skip = `&$skip=${(page - 1) * itemsPerPage}`;
        }
        let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and CreatedAt eq ${this.DateOfIssueIdNumber}${filter}&$count=true${top}${skip}`;
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
    async getIdFromOrder() {
      let resp = await this.$stores.api.get(
        `http://localhost:60189/Order/GetId`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data;
      }
      return null;
    },
    async getIdFromStockOrder() {
      let resp = await this.$stores.api.get(
        `http://localhost:60189/Order/GetInStockId`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data;
      }
      return null;
    },
    formatJson(filterVal, jsonData) {
      let data = jsonData.map((v) => {
        return {
          Number: jsonData.findIndex((_) => _.Id == v.Id) + 1,
          Id: v.Id,
          CustomerName: v.CustomerName,
          TheAddress: v.TheAddress,
          PhoneNumber: v.PhoneNumber,
          Sum: v.Cod + v.ShipFee > 0 ? v.Cod + v.ShipFee : 0,
        };
      });
      let res = data.map((v) => filterVal.map((j) => v[j]));
      return res;
    },
    async checkInStock() {
      let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdStaff}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/DeletedAt eq ${this.DateOfIssueIdNumber})`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        let total = data["@odata.count"];
        return data.value;
      }
      return [];
    },
    formatNumber(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    print() {
      window.print();
    },
    exportExcel() {
      const filterVal = [
        "Number",
        "Id",
        "CustomerName",
        "TheAddress",
        "PhoneNumber",
        "Sum",
      ];
      const headerDisplay = [
        "Stt",
        "Mã",
        "Tên",
        "Địa chỉ",
        "Số điện thoại",
        "Tổng thu",
      ];

      const Name = this.Users.filter((_) => _.Id == this.IdStaff).map(
        (_) => _.Name
      );
      Name.push(this.dateFormatted);

      const dataSuccess = this.formatJson(filterVal, this.Orders);
      const successData = [headerDisplay, ...dataSuccess];
      const newDataSuccess = [Name, ...successData];

      const dataHalf = this.formatJson(filterVal, this.stockOrders);
      const HalfData = [headerDisplay, ...dataHalf];
      const newDataHalf = [Name, ...HalfData];

      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(newDataSuccess),
        wsh = XLSX.utils.aoa_to_sheet(newDataHalf);

      ws.font = { size: 13 };
      let wscols = [
        { wch: 5 },
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

      XLSX.utils.book_append_sheet(wb, ws, "DonHangGiao");
      XLSX.utils.book_append_sheet(wb, wsh, "DonHangTonGiao");

      XLSX.writeFile(wb, "DonHangNhanVien.xlsx");
    },
    onEnterCode() {
      this.IdTheOrder = [...new Set(this.IdTheOrder)];
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
  .btnDelivery {
    display: none;
  }
}
</style>
