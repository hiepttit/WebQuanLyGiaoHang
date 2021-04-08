<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" style="text-align: center;">
        <v-row>
          <v-col cols="4"> </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="search"
              class=""
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
            <v-btn
              color="success"
              rounded
              style="margin-left: 10px"
              class="mr-0 btnDelivery"
              @click="getDataFromApi()"
            >
              Tìm kiếm
            </v-btn>
          </v-col>
          <v-col cols="4"> </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="12">
        <base-material-card color="green" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Kết quả tìm kiếm
            </div>
          </template>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="primary--text">
                    Mã
                  </th>
                  <th class="primary--text">
                    Tên shop
                  </th>
                  <th class="primary--text">
                    Tên nhân viên
                  </th>
                  <th class="primary--text">
                    Ngày tạo đơn
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
                    Trạng thái ship
                  </th>
                  <th class="primary--text">
                    Trạng thái thanh toán shop
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(item, i) in Orders">
                  <tr :key="`r${i}`">
                    <td>{{ item.Id }}</td>
                    <td>{{ item.ShopName }}</td>
                    <td>{{ item.Staff }}</td>
                    <td>{{ monentDate(new Date(item.CreatedAt)) }}</td>
                    <td>{{ item.CustomerName }}</td>
                    <td>{{ item.TheAddress }}</td>
                    <td>{{ item.PhoneNumber }}</td>
                    <td>
                      <template v-if="item.Cod > 0">
                        {{ formatNumber(item.Cod) }}
                      </template>
                      <template v-else>
                        {{ item.Cod }}
                      </template>
                    </td>
                    <td>{{ formatNumber(item.ShipFee) }}</td>
                    <td>
                      <template
                        v-if="item.TheStatus == null || item.TheStatus == 0"
                      >
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
                    </td>
                    <td>
                      <template
                        v-if="item.IsSuccess == null || item.IsSuccess == 0"
                      >
                        <v-btn color="warning">
                          Chưa thanh toán
                        </v-btn>
                      </template>
                      <template v-if="item.IsSuccess == 1">
                        <v-btn color="#1867c0">
                          Đã thanh toán
                        </v-btn>
                      </template>
                    </td>
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
import XLSX from "xlsx";

export default {
  metaInfo: {
    title: "Quan Ly Don Hang",
  },
  async mounted() {
    this.IdUser = await this.getUser();
    console.log(this.IdUser);
  },
  watch: {},
  data() {
    return {
      IdUser: "",
      IdOrder: "",
      search: "",
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      loading: true,
      Shop: [],
      Orders: [],
      url: this.$urlApi,
    };
  },

  methods: {
    async getUser() {
      let resp = await this.$stores.api.get(
        `${this.url}/TheUserView?$orderby=Name asc`
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
      this.getOrders(this.search).then((data) => {
        console.log(data);
        this.Orders = data.map((_) => {
          return {
            Id: _.Id,
            CustomerName: _.CustomerName,
            PhoneNumber: _.PhoneNumber,
            CreatedAt: _.CreatedAt,
            IsSuccess: _.IsSuccess,
            TheAddress: _.TheAddress,
            TheStatus: _.TheStatus,
            ShipFee: _.ShipFee,
            Cod: _.Cod,
            ShopName: this.getName(_.IdShop),
            Staff: _.DeliveryOrders.length
              ? this.getName(_.DeliveryOrders[0].IdStaff)
              : "Chưa có nhân viên giao",
          };
        });
        this.loading = false;
      });
    },
    getName(id) {
      let arr = this.IdUser;
      let res = arr.find((_) => _.Id == id);
      if (res) return res.Name;
      else return "";
    },
    formatNumber(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    async getOrders(search) {
      let url = `${this.url}/Orders?$expand=DeliveryOrders&$filter=contains(Id, '${search}')`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
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
