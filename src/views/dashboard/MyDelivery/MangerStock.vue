<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Số lượng: {{ total }}</h1>
        <base-material-card color="warning" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Đơn hàng tồn
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
              Danh sách tất cả đơn hàng tồn
            </div>
          </template>
          <v-card-text>
            <template v-if="isCreate == true">
              <v-data-table
                :headers="headersCreate"
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
              </v-data-table>
            </template>
            <template v-else>
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
                <!-- <template v-slot:item.Cod="{ item }">
                  <div>{{ formatNumber(item.Cod) }}</div>
                </template>
                <template v-slot:item.ShipFee="{ item }">
                  <div>{{ formatNumber(item.ShipFee) }}</div>
                </template> -->
                <template v-slot:item.Sum="{ item }">
                  <div v-if="item.RealReceive == null">
                    {{ formatNumber(item.ShipFee + item.Cod) }}
                  </div>
                  <div v-else>{{ formatNumber(item.RealReceive) }}</div>
                </template>
                <template v-slot:item.Status="{ item }">
                  <template v-if="item.DeliveryOrders[0].TheStatus == 2">
                    <v-btn
                      color="warning"
                      @click="UpdateDeliveryStatus(item.Id, 1)"
                    >
                      Bàn giao
                    </v-btn>
                  </template>
                  <template v-if="item.DeliveryOrders[0].TheStatus == 1">
                    <v-btn
                      color="success"
                      @click="UpdateDeliveryStatus(item.Id, 2)"
                    >
                      Kết thúc
                    </v-btn>
                  </template>
                </template>
                <template v-slot:item.Action="{ item }">
                  <template
                    v-if="item.TheStatus == null || item.TheStatus == 3"
                  >
                    <v-btn color="teal" @click="onState(item)">
                      Đang giao
                      <i
                        aria-hidden="true"
                        class="v-icon mdi mdi-pencil-outline"
                      >
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
                  <template v-if="item.TheStatus == 4">
                    <v-btn color="#5cbbf6" @click="onState(item)">
                      Hoàn thành 1 phần
                      <i
                        aria-hidden="true"
                        class="v-icon mdi mdi-pencil-outline"
                      >
                      </i>
                    </v-btn>
                  </template>
                </template>
              </v-data-table>
            </template>
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

export default {
  props: ["IdUser", "DateOfIssueIdNumber", "isCreate"],
  components: { myModal },
  data() {
    return {
      pageCount: 0,
      options: {},
      total: 0,
      menu: false,
      menuModal: false,
      Show: false,
      loading: true,
      Orders: [],
      nameShop: "",
      Receive: 0,
      search: "",
      objAddOrder: {},
      url: this.$urlApi,
      headers: [
        { text: "Stt", align: "center", sortable: false, value: "Stt" },
        { text: "Mã", align: "start", sortable: false, value: "Id" },
        { text: "Tên khách hàng", align: "start", value: "CustomerName" },
        { text: "Địa chỉ", value: "TheAddress", align: "left" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        // { text: "COD", value: "Cod" },
        // { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
        { text: "Trạng thái giao", value: "Status" },
        { text: "Trạng thái", value: "Action" },
      ],
      headersCreate: [
        { text: "Stt", align: "center", sortable: false, value: "Stt" },
        { text: "Mã", align: "start", sortable: false, value: "Id" },
        { text: "Tên khách hàng", align: "start", value: "CustomerName" },
        { text: "Địa chỉ", value: "TheAddress", align: "left" },
        { text: "Số điện thoại", value: "PhoneNumber" },
        { text: "COD", value: "Cod" },
        { text: "Ship", value: "ShipFee" },
        { text: "Tổng thu", value: "Sum" },
      ],
      defaultStateSelected: 0,
      States: [
        // { Id: "0", Name: "Đang giao" },
        { Id: "1", Name: "Thành công" },
        { Id: "2", Name: "Trả hàng" },
        { Id: "4", Name: "Hoàn thành 1 phần" },
      ],
      IdKey: "",
      realReceive: null,
    };
  },
  async mounted() {
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
      this.getDataFromApi();
    },
    IdUser(val) {
      this.getDataFromApi();
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
    },
  },
  methods: {
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
        this.$emit("stockOrder", this.Orders);
        this.$emit("hasStock", this.Orders);
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
        let url = `${this.url}/Orders?$expand=StockOrders,DeliveryOrders&$filter=DeliveryOrders/any(x:x/IdStaff eq '${this.IdUser}')and StockOrders/any(x:x/Id ne null) and StockOrders/any(x:x/DeletedAt eq ${this.DateOfIssueIdNumber})${filter}&$count=true${top}${skip}`;
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
    async UpdateDeliveryStatus(IdKey, status) {
      try {
        let obj = {};
        obj.TheStatus = status;
        let url = `${this.url}/DeliveryOrders/${IdKey}`;
        let resp = await this.$stores.api.patch(`${url}`, obj);
        if (resp && resp.status == 200) {
          this.getDataFromApi();
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
            this.getDataFromApi();
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
      this.defaultStateSelected = 0;
      this.IdKey = item.Id;
      let data = await this.getShopById(item.IdShop);
      this.nameShop = data[0].Name;
      this.Receive = item.Cod + item.ShipFee;
      if (item.TheStatus == 3) {
        this.Show = true;
      }
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
<style lang="scss"></style>
