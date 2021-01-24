<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row>
      <v-col cols="12" md="6"><h1>Tổng: 10</h1></v-col>
      <v-col cols="12" md="4">
        <v-btn
          color="success"
          style="float: right"
          rounded
          class="mr-0"
          @click="isShow = true"
        >
          Thêm
        </v-btn></v-col
      >
      <v-col cols="12" md="12">
        <base-material-card color="warning" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Employees Stats
              <v-card-title style="width: 200px; float: right">
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
            <v-data-table :search="search" :headers="headers" :items="Staff" />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
    <v-row> 
      <v-col cols="12" md="12">
        <base-material-card color="green" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Nhân viên
              <v-card-title style="width: 200px; float: right">
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
            <v-data-table :search="search" :headers="headers" :items="Staff" />
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
        <v-select
          item-text="Name"
          item-value="Name"
          :items="Province"
          label="Nơi cấp*"
          required
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-text-field label="Địa chỉ:" required></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Province"
          label="Tỉnh/Thành phố*"
          v-model="ProvinceId"
          required
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="District"
          v-bind:class="{ disabled: District.length ? false : true }"
          label="Quận/Huyện/Thành phố/Thị xã*"
          v-model="DistrictId"
          required
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="Ward"
          v-bind:class="{ disabled: Ward.length ? false : true }"
          label="Phường/Xã*"
          required
        ></v-select>
      </v-col>
      <v-col cols="6">
        <v-select
          item-text="Name"
          item-value="Id"
          :items="roles"
          label="Vai trò*"
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

export default {
  components: { myModal },
  name: "DataTable",
  async mounted() {
    this.Province = await this.getProvince();
    this.roles = await this.getRoles();
    // this.Staff = await this.getStaff();
  },
  watch: {
    date(val) {
      this.dateFormatted = this.formatDate(this.date);
    },
    async ProvinceId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `http://localhost:60189/odata/District?$filter=ProvinceId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.District = data.value;
        }
      }
    },
    async DistrictId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `http://localhost:60189/odata/Ward?$filter=DistrictId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.Ward = data.value;
        }
      }
    },
  },
  data() {
    return {
      Province: [],
      ProvinceId: null,
      District: [],
      DistrictId: null,
      Ward: [],
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      isShow: false,
      roles: [],
      search: "",
      headers: [
        {
          sortable: false,
          text: "Name",
          value: "Name",
        },
        {
          sortable: false,
          text: "Phone",
          value: "PhoneNumber",
          // align: "right",
        },
        {
          sortable: false,
          text: "TheAddress",
          value: "TheAddress",
        },
        {
          sortable: false,
          text: "CMND",
          value: "IdNumber",
        },
       
      ],
      Staff:[{id: 4, name: "Phan Tinh", idNumber: "01234567865", phoneNumber: "01665645580"}],
    };
  },

  methods: {
    async getProvince() {
      let resp = await this.$stores.api.get(
        "http://localhost:60189/odata/Province?$orderby=Name asc"
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return [];
    },
    async getRoles() {
      let resp = await this.$stores.api.get(
        "http://localhost:60189/odata/Roles?$orderby=Name asc"
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return [];
    },
    async getStaff() {
      let resp = await this.$stores.api.get(
        "http://localhost:60189/odata/TheUsers/2"
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
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    SaveModal() {
      console.log(this.ProvinceId);
      debugger;
    },
  },
};
</script>
<style scoped>
.disabled {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6;
  border-color: #d1dbe5;
}
</style>