<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" md="6"><h1>Tổng: 10</h1></v-col>
      <v-col cols="12" md="4">
        <v-btn
          color="success"
          style="float:right"
          rounded
          class="mr-0"
          @click="isShow = true"
        >
          Thêm
        </v-btn></v-col
      >
      <v-col cols="12" md="12">
        <base-material-card
          icon="mdi-clipboard-text"
          title="Nhân viên"
          class="px-5 py-3"
        >
          <v-simple-table>
            <thead>
              <tr>
                <th class="primary--text">
                  STT
                </th>
                <th class="primary--text">
                  Tên
                </th>
                <th class="primary--text">
                  CMND
                </th>
                <th class="primary--text">
                  Địa chỉ
                </th>
                <th class="primary--text">
                  Số điện thoại
                </th>
                <th class="primary--text">
                  Tài khoản ngân hàng
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, i) in userInfo" :key="`tr-${i}`">
                <td>{{ i }}</td>
                <td>{{ user.Name }}</td>
                <td>
                  Số: {{ user.IdNumber }}
                  <div>
                    Ngày cấp: {{ monentDate(user.DateOfIssueIdNumber) }}
                  </div>
                  <div>Nơi cấp: {{ user.PlaceOfIssueIdNumber }}</div>
                </td>
                <td>{{ user.TheAddress }}</td>
                <td>{{ user.PhoneNumber }}</td>
                <td>
                  {{ user.BankAccountNumber }}
                  <div>Ngân hàng: {{ user.BankName }}</div>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </base-material-card>

        <div class="py-3" />

        <base-material-card color="warning" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Phường
              <v-card-title style="width:200px; float: right">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
            </div>

            <div class="subtitle-1 font-weight-light">
              New employees on 15th September, 2016
            </div>
          </template>
          <v-card-text>
            <v-data-table
              :search="search"
              :headers="headers"
              :items="desserts"
              :options.sync="options"
              :server-items-length="totalDesserts"
              :loading="loading"
            />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
    <my-Modal :title="'Tạo người dùng'" :show="isShow" @close="isShow = false">
      <v-col cols="12" sm="6" md="6">
        <v-text-field label="Họ tên:*" required></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          label="Số điện thoại"
          hint="example of helper text only on focus"
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Legal last name*"
                  hint="example of persistent helper text"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col> -->
      <v-col cols="6">
        <v-text-field label="Tên đăng nhập:*" required></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Mật khẩu*" type="password" required></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field type="number" label="CMND:*" required></v-text-field>
      </v-col>
      <v-col cols="6">
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
              label="Ngày cấp:"
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              @blur="date = parseDate(dateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Nơi cấp:" required></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Địa chỉ:" required></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-select
          :items="['Admin', 'User', 'Test']"
          label="Vai trò*"
          required
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Province"
          label="Tỉnh/Thành phố*"
          v-model="ProvinceId"
          required
        ></v-select>
      </v-col>
      <v-col cols="6">
        <v-text-field
          type="number"
          label="Tài khoàn ngân hàng:"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field label="Tên ngân hàng:" required></v-text-field>
      </v-col>
      <!-- <v-col cols="12" sm="6">
                <v-select
                  :items="['0-17', '18-29', '30-54', '54+']"
                  label="Age*"
                  required
                ></v-select>
              </v-col> -->
      <!-- <v-col cols="12" sm="6">
                <v-autocomplete
                  :items="[
                    'Skiing',
                    'Ice hockey',
                    'Soccer',
                    'Basketball',
                    'Hockey',
                    'Reading',
                    'Writing',
                    'Coding',
                    'Basejump'
                  ]"
                  label="Interests"
                  multiple
                ></v-autocomplete>
              </v-col> -->
      <template v-slot:m-foot>
        <v-btn color="blue darken-1" text @click="SaveModal()"> Save </v-btn>
      </template>
    </my-Modal>
  </v-container>
</template>

<script>
import myModal from "../components/core/Modal";
import moment from "moment";

export default {
  components: { myModal },
  name: "DataTable",
  async mounted() {
    this.Province = await this.getProvince();
    this.userInfo = await this.getUser();
    this.getDataFromApi();
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date);
    },
    async ProvinceId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `http://localhost:60189/odata/District?$filter=ProvinceId eq ${val}`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          console.log(data);
          return data.value;
        }
        return null;
      }
    },
    options: {
      immediate: false,
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    search: {
      handler(val) {
        this.getDataFromApi();
      },
    },
  },
  data() {
    return {
      Province: [],
      ProvinceId: null,
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      isShow: false,
      search: "Ho",
      userInfo: [],
      url: "http://localhost:60189/odata",
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options: {},
      headers: [
        {
          text: "Dessert (100g serving)",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Calories", value: "calories" },
        { text: "Fat (g)", value: "fat" },
        { text: "Carbs (g)", value: "carbs" },
        { text: "Protein (g)", value: "protein" },
        { text: "Iron (%)", value: "iron" },
      ],
    };
  },

  methods: {
    async getProvince() {
      let resp = await this.$stores.api.get(`${this.url}/Province`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
    },
    async getUser() {
      let resp = await this.$stores.api.get(
        `${this.url}/TheUserView?$filter= IdRole eq 2`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
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
    SaveModal() {
      console.log(this.ProvinceId);
      debugger;
    },
    getDataFromApi() {
      this.loading = true;
      this.fakeApiCall().then((data) => {
        this.desserts = data.items;
        this.totalDesserts = data.total;
        this.loading = false;
      });
    },
    async fakeApiCall() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;
      const search = this.search;

      let data = await this.getDesserts(page, itemsPerPage, search);
      return {
        items: data.items,
        total: data.total,
      };
    },
    async getDesserts(page, itemsPerPage, search) {
      let top = itemsPerPage;
      let skip = (page - 1) * itemsPerPage;
      let filter = search && `&$filter=contains(Name, '${search}')`;
      let url = `http://localhost:60189/odata/district?$count=true&$top=${top}&$skip=${skip}${filter}`;
      let resp = await this.$stores.api.get(`${url}`);
      if (resp && resp.status == 200) {
        let data = await resp.json();
        let total = data["@odata.count"];
        return {
          total,
          items: data.value.map((_) => {
            return {
              name: _.Name,
              calories: 159,
              fat: 6.0,
              carbs: 24,
              protein: 4.0,
              iron: "1%",
            };
          }),
        };
      }
      return { total: 0, items: [] };
    },
  },
};
</script>
