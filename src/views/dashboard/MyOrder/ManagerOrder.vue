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
              <template v-slot:item.Sum="{ item }">
                <div v-if="item.RealReceive == null">
                  {{ item.ShipFee + item.Cod }}
                </div>
                <div v-else>{{ item.RealReceive }}</div>
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

export default {
  name: "Orders",
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
  data() {
    return {
      IdShop: "",
      pageCount: 0,
      options: {},
      total: 0,
      IdOrder: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
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
        { text: "Địa chỉ", value: "TheAddresss", align: "left" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        { text: "COD", value: "Cod" },
        { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
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
        // this.totalCodSucess = this.sum(
        //   data.items.filter((_) => _.IsSuccess == 1),
        //   "Cod"
        // );
        this.countSucess = data.items.filter((_) => _.IsSuccess == 1).length;
        this.countUnSucess = data.items.filter((_) => _.IsSuccess == 0).length;
        this.countRealUnSucess = data.items.filter(
          (_) => _.IsSuccess == 0 && _.RealReceive != null
        ).length;
        // this.totalShipSucess = this.sum(
        //   data.items.filter((_) => _.IsSuccess == 1),
        //   "ShipFee"
        // );
        // this.totalCodUnSucess = this.sum(
        //   data.items.filter((_) => _.IsSuccess == 0),
        //   "Cod"
        // );
        // this.totalShipUnSucess = this.sum(
        //   data.items.filter((_) => _.IsSuccess == 0),
        //   "ShipFee"
        // );
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

      let data = await this.getOrders(page, itemsPerPage);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getOrders(page, itemsPerPage) {
      let top = "";
      let skip = "";
      if (this.IdShop) {
        if (itemsPerPage > 0) {
          top = `&$top=${itemsPerPage}`;
          skip = `&$skip=${(page - 1) * itemsPerPage}`;
        }
        // let filter = search && ` contains(Name, '${search}')`;
        let url = `${this.url}/Orders?$filter=IdShop eq '${this.IdShop}'and CreatedAt eq ${this.DateOfIssueIdNumber}&$count=true${top}${skip}`;
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
    // async onState(item) {
    //   this.IdKey = item.Id;
    //   if (item.IsSuccess == 0) {
    //     this.Show = true;
    //   }
    // },
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
