<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Users"
          v-model="IdUser"
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
              v-on="on"
              style="width:40%;margin: 0 auto;"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="DateOfIssueIdNumber"
            @input="menu = false"
          ></v-date-picker>
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
              <template v-slot:item.Action="{ item }">
                <template v-if="item.TheStatus == null || item.TheStatus == 0">
                  <v-btn dark color="teal" @click="onState(item)">
                    Đang giao
                    <i aria-hidden="true" class="v-icon mdi mdi-pencil-outline">
                    </i>
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 1">
                  <v-btn color="success" @click="onState(item)">
                    Thành công
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 2">
                  <v-btn color="error" @click="onState(item)">
                    Trả hàng
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 3">
                  <v-btn color="warning" @click="onState(item)">
                    Tồn kho
                  </v-btn>
                </template>
                <template v-if="item.TheStatus == 4">
                  <v-btn color="#5cbbf6" @click="onState(item)">
                    Hoàn thành 1 phần
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
      <template v-if="check.length">
        <v-col cols="12" md="12">
          <StockTable
            :IdUser="IdUser"
            :DateOfIssueIdNumber="DateOfIssueIdNumber"
          ></StockTable>
        </v-col>
      </template>
    </v-row>
    <my-Modal
      :show="Show"
      :title="'CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG'"
      @close="Show = false"
    >
      <v-col cols="12">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="States"
          v-model="defaultStateSelected"
          label="Chọn trạng thái"
          dense
          outlined
        ></v-select>
      </v-col>
      <template v-if="defaultStateSelected == 3">
        <v-col cols="6">
          <v-menu
            v-model="menuModal"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateFormattedModal"
                label="Hoãn tới ngày:"
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                @blur="date = parseDate(dateFormattedModal)"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="DateOfIssueIdNumberModal"
              @input="menuModal = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="6">
          <label> Shop: {{ nameShop }} </label>
        </v-col>
      </template>
      <template v-if="defaultStateSelected == 4">
        <v-col cols="6">
          <v-text-field
            v-model="realReceive"
            label="Thực thu:"
            type="number"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <div>
            <label> Shop: {{ nameShop }} </label>
          </div>
          <div>
            <label> Tổng đơn: {{ Receive }} </label>
          </div>
        </v-col>
      </template>
      <template v-slot:m-foot>
        <v-btn color="blue darken-1" text @click="UpdateState()">
          Ok
        </v-btn>
      </template>
    </my-Modal>
  </v-container>
</template>

<script>
import moment from "moment";
import myModal from "../components/Modal.vue";
import StockTable from "./MangerStock.vue";

export default {
  metaInfo: {
    title: "Quan Ly Giao Hang",
  },
  components: { myModal, StockTable },
  data() {
    return {
      IdUser: "",
      pageCount: 0,
      options: {},
      total: 0,
      IdOrder: "",
      DelayDate: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      DateOfIssueIdNumberModal: new Date().toISOString().substr(0, 10),
      dateFormattedModal: this.formatDate(
        new Date().toISOString().substr(0, 10)
      ),
      menu: false,
      menuModal: false,
      Show: false,
      loading: true,
      Users: [],
      Orders: [],
      nameShop: "",
      Receive: 0,
      search: "",
      objAddOrder: {},
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
        { text: "Trạng thái", value: "Action" },
      ],
      defaultStateSelected: 0,
      States: [
        // { Id: "0", Name: "Đang giao" },
        { Id: "1", Name: "Thành công" },
        { Id: "2", Name: "Trả hàng" },
        { Id: "3", Name: "Tồn kho" },
        { Id: "4", Name: "Hoàn thành 1 phần" },
      ],
      IdKey: "",
      data: [],
      realReceive: null,
      check: [],
    };
  },
  async mounted() {
    this.Users = await this.getUser();
    this.getDataFromApi();
  },
  watch: {
    async DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(val);
      this.check = await this.checkInStock();
      this.getDataFromApi();
    },
    DateOfIssueIdNumberModal(val) {
      this.dateFormattedModal = this.formatDate(val);
    },
    async IdUser(val) {
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
    async checkInStock() {
      let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdUser}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/DeletedAt eq ${this.DateOfIssueIdNumber})`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        let total = data["@odata.count"];
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
      this.fakeApiCall().then((data) => {
        this.Orders = data.items;
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
      if (itemsPerPage > 0) {
        top = `&$top=${itemsPerPage}`;
        skip = `&$skip=${(page - 1) * itemsPerPage}`;
      }
      if (this.IdUser) {
        let filter = search && ` and contains(Id, '${search}')`;
        let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdUser}') and CreatedAt eq ${this.DateOfIssueIdNumber}${filter}&$count=true${top}${skip}`;
        let resp = await this.$stores.api.get(`${url}`);
        if (resp && resp.status == 200) {
          let data = await resp.json();
          let total = data["@odata.count"];
          return {
            total,
            items: data.value.filter((_) => _.DeliveryOrders.length > 0),
          };
        }
        return { total: 0, items: [] };
      }
      return { total: 0, items: [] };
    },
    async UpdateState() {
      let state = {};
      state.TheStatus = this.defaultStateSelected;
      let key = this.IdKey;
      let order = this.Orders.filter((_) => _.Id == this.IdKey.toString());
      let price = order[0].Cod + order[0].ShipFee;
      let url = `${this.url}/Orders/${key}`;
      if (this.defaultStateSelected == 1 || this.defaultStateSelected == 2) {
        state.RealReceive = price;
      }
      if (this.defaultStateSelected == 3) {
        let check = await this.UpdateStateDelay();
        if (!check) {
          return;
        }
        state.IsInStock = 1;
      }
      if (this.defaultStateSelected == 4) {
        let check = await this.UpdateStateHalf();
        if (!check) {
          return;
        }
      }
      let resp = await this.$stores.api.patch(`${url}`, state);
      if (resp && resp.status == 200) {
        alert("Updated successfully.");
        this.Show = false;
        this.getDataFromApi();
      } else {
        alert("Updated failed.");
      }
    },
    async UpdateStateDelay() {
      try {
        let stock = {};
        stock.IdTheOrder = this.IdKey;
        stock.Delaydate = this.DateOfIssueIdNumberModal;
        let url = `${this.url}/StockOrder`;
        let resp = await this.$stores.api.post(`${url}`, stock);
        if (resp && resp.status == 200) {
          return true;
        }
      } catch (e) {
        let x = await e.json();
        alert(x.detail);
        return false;
      }
    },
    async UpdateStateHalf() {
      try {
        let half = {};
        half.RealReceive = this.realReceive;
        let url = `${this.url}/Orders/${this.IdKey}`;

        let order = this.Orders.filter((_) => _.Id == this.IdKey.toString());
        let price = order[0].Cod + order[0].ShipFee;
        if (half.RealReceive > 0 && half.RealReceive < price) {
          let resp = await this.$stores.api.patch(`${url}`, half);
          if (resp && resp.status == 200) {
            return true;
          }
        } else {
          alert("Mức thu không chính xác");
        }
      } catch (e) {
        let x = await e.json();
        alert(x.detail);
        return false;
      }
    },
    async getShopById(Id) {
      let resp = await this.$stores.api.get(
        `${this.url}/TheUserView/${Id}?$orderBy=Name asc`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
    },
    async onState(item) {
      this.DateOfIssueIdNumberModal = new Date().toISOString().substr(0, 10);
      this.dateFormattedModal = this.formatDate(
        new Date().toISOString().substr(0, 10)
      );
      this.realReceive = null;
      this.defaultStateSelected = 0;
      this.IdKey = item.Id;
      let delayDate = await this.getDelayDate(item.Id);
      if (delayDate.length) {
        this.dateFormattedModal = this.monentDate(
          new Date(delayDate[0].Delaydate).toLocaleDateString()
        );
      }
      let data = await this.getShopById(item.IdShop);
      this.nameShop = data[0].Name;
      this.Receive = item.Cod + item.ShipFee;
      if (item.TheStatus == 0) {
        this.Show = true;
      }
      if (item.TheStatus == 3) {
        this.defaultStateSelected = 3;
      }
    },
    async getDelayDate(idOrder) {
      let resp = await this.$stores.api.get(
        `${this.url}/StockOrder?$select=Delaydate&$filter=IdTheOrder eq '${idOrder}'`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
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
.v-btn {
  width: 10rem;
}
.v-btn span {
  font-size: 0.8rem;
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
