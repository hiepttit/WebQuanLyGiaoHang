<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" md="12">
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
      </v-col>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ OrdersSuccess.length }}</h1>
        <h1>Tổng: {{ totalSuccess }}</h1>
        <base-material-card color="green" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng thành công
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
              Danh sách tất cả đơn hàng thành công
            </div>
          </template>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="primary--text">
                    Stt
                  </th>
                  <th class="primary--text">
                    Mã
                  </th>
                  <th class="primary--text">
                    Tên khách hàng
                  </th>
                  <th class="primary--text">
                    Địa chỉ
                  </th>
                  <th class="primary--text">
                    Số điện thoại
                  </th>
                  <th class="primary--text">
                    COD
                  </th>
                  <th class="primary--text">
                    Ship
                  </th>
                  <th class="primary--text">
                    Tổng thu
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(item, i) in OrdersSuccess">
                  <tr :key="`r${i}`">
                    <td>{{ i }}</td>
                    <td>{{ item.Id }}</td>
                    <td>{{ item.CustomerName }}</td>
                    <td>{{ item.TheAddresss }}</td>
                    <td>{{ item.PhoneNumber }}</td>
                    <td>{{ item.Cod }}</td>
                    <td>{{ item.ShipFee }}</td>
                    <td>{{ item.RealReceive }}</td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </base-material-card>
      </v-col>
      <template v-if="OrdersSuccessStock.length">
        <v-col cols="12" md="12">
          <h1>Số lượng: {{ OrdersSuccessStock.length }}</h1>
          <h1>Tổng: {{ totalSuccessStock }}</h1>
          <base-material-card color="#1867c0" class="px-5 py-3">
            <template v-slot:heading>
              <div class="display-2 font-weight-light">
                Đơn hàng tồn kho đã hoàn thành
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
                Danh sách tất cả đơn hàng tồn kho đã hoàn thành
              </div>
            </template>
            <v-card-text>
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="primary--text">
                      Stt
                    </th>
                    <th class="primary--text">
                      Mã
                    </th>
                    <th class="primary--text">
                      Tên khách hàng
                    </th>
                    <th class="primary--text">
                      Địa chỉ
                    </th>
                    <th class="primary--text">
                      Số điện thoại
                    </th>
                    <th class="primary--text">
                      COD
                    </th>
                    <th class="primary--text">
                      Ship
                    </th>
                    <th class="primary--text">
                      Tổng thu
                    </th>
                    <th class="primary--text">
                      Thực thu
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template v-for="(item, i) in OrdersSuccessStock">
                    <tr :key="`r${i}`">
                      <td>{{ i + 1 }}</td>
                      <td>{{ item.Id }}</td>
                      <td>{{ item.CustomerName }}</td>
                      <td>{{ item.TheAddresss }}</td>
                      <td>{{ item.PhoneNumber }}</td>
                      <td>{{ item.Cod }}</td>
                      <td>{{ item.ShipFee }}</td>
                      <td>{{ item.Cod + item.ShipFee }}</td>
                      <td>{{ item.RealReceive }}</td>
                    </tr>
                  </template>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </base-material-card>
        </v-col>
      </template>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ OrdersFail.length }}</h1>
        <h1>Tổng: {{ totalFail }}</h1>
        <base-material-card color="error" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng trả
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
              Danh sách tất cả đơn hàng trả
            </div>
          </template>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="primary--text">
                    Stt
                  </th>
                  <th class="primary--text">
                    Mã
                  </th>
                  <th class="primary--text">
                    Tên khách hàng
                  </th>
                  <th class="primary--text">
                    Địa chỉ
                  </th>
                  <th class="primary--text">
                    Số điện thoại
                  </th>
                  <th class="primary--text">
                    COD
                  </th>
                  <th class="primary--text">
                    Ship
                  </th>
                  <th class="primary--text">
                    Tổng thu
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(item, i) in OrdersFail">
                  <tr :key="`r${i}`">
                    <td>{{ i }}</td>
                    <td>{{ item.Id }}</td>
                    <td>{{ item.CustomerName }}</td>
                    <td>{{ item.TheAddresss }}</td>
                    <td>{{ item.PhoneNumber }}</td>
                    <td>{{ item.Cod }}</td>
                    <td>{{ item.ShipFee }}</td>
                    <td>{{ item.RealReceive }}</td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </base-material-card>
      </v-col>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ OrdersDelay.length }}</h1>
        <h1>Tổng: {{ totalDelay }}</h1>
        <base-material-card color="warning" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng hoãn
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
              Danh sách tất cả đơn hàng hoãn
            </div>
          </template>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="primary--text">
                    Stt
                  </th>
                  <th class="primary--text">
                    Mã
                  </th>
                  <th class="primary--text">
                    Tên khách hàng
                  </th>
                  <th class="primary--text">
                    Địa chỉ
                  </th>
                  <th class="primary--text">
                    Số điện thoại
                  </th>
                  <th class="primary--text">
                    COD
                  </th>
                  <th class="primary--text">
                    Ship
                  </th>
                  <th class="primary--text">
                    Hoãn tới
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(item, i) in OrdersDelay">
                  <tr :key="`r${i}`">
                    <td>{{ i }}</td>
                    <td>{{ item.Id }}</td>
                    <td>{{ item.CustomerName }}</td>
                    <td>{{ item.TheAddresss }}</td>
                    <td>{{ item.PhoneNumber }}</td>
                    <td>{{ item.Cod }}</td>
                    <td>{{ item.ShipFee }}</td>
                    <td>{{ formatdelayDate(item.StockOrders) }}</td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </base-material-card>
      </v-col>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ OrdersHalf.length }}</h1>
        <h1>Tổng: {{ totalHalf }}</h1>
        <base-material-card color="#5cbbf6" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng thành công một phần
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
              Danh sách tất cả đơn hàng thành công 1 phần
            </div>
          </template>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="primary--text">
                    Stt
                  </th>
                  <th class="primary--text">
                    Mã
                  </th>
                  <th class="primary--text">
                    Tên khách hàng
                  </th>
                  <th class="primary--text">
                    Địa chỉ
                  </th>
                  <th class="primary--text">
                    Số điện thoại
                  </th>
                  <th class="primary--text">
                    COD
                  </th>
                  <th class="primary--text">
                    Ship
                  </th>
                  <th class="primary--text">
                    Tổng thu
                  </th>
                  <th class="primary--text">
                    Thực thu
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(item, i) in OrdersHalf">
                  <tr :key="`r${i}`">
                    <td>{{ i }}</td>
                    <td>{{ item.Id }}</td>
                    <td>{{ item.CustomerName }}</td>
                    <td>{{ item.TheAddresss }}</td>
                    <td>{{ item.PhoneNumber }}</td>
                    <td>{{ item.Cod }}</td>
                    <td>{{ item.ShipFee }}</td>
                    <td>{{ item.Cod + item.ShipFee }}</td>
                    <td>{{ item.RealReceive }}</td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";

export default {
  name: "Orders",
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
        let url = `${this.url}/Orders?$expand=StockOrders&$filter=IdShop eq '${this.IdShop}'and StockOrders/any(x:x/CreatedAt eq ${this.DateOfIssueIdNumber})&$count=true`;
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
