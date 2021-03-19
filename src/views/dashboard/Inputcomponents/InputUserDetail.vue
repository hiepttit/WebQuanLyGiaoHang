<template>
  <my-Modal :show="isShow" :title="'Tạo người dùng'" @close="$emit('close')">
    <v-col cols="12" sm="6" md="6">
      <v-text-field
        label="Họ tên:*"
        v-model="objAddUser.Name"
        required
      ></v-text-field>
    </v-col>
    <v-col cols="12" sm="6" md="6">
      <v-text-field
        label="Số điện thoại"
        v-model="objAddUser.PhoneNumber"
        type="number"
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
    <template v-if="Create">
      <v-col cols="6">
        <v-text-field
          label="Tên đăng nhập:*"
          v-model="objAddUser.UserName"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Mật khẩu*"
          v-model="objAddUser.Pwd"
          type="password"
          required
        ></v-text-field>
      </v-col>
    </template>

    <v-col cols="4">
      <v-text-field
        type="number"
        v-model="objAddUser.IdNumber"
        label="CMND:*"
        required
      ></v-text-field>
    </v-col>
    <v-col cols="4">
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
        <v-date-picker
          v-model="DateOfIssueIdNumber"
          @input="menu = false"
        ></v-date-picker>
      </v-menu>
    </v-col>
    <v-col cols="4">
      <v-select
        item-text="Name"
        item-value="Name"
        :items="Province"
        label="Nơi cấp*"
        v-model="objAddUser.PlaceOfIssueIdNumber"
        required
      ></v-select>
    </v-col>
    <v-col cols="3">
      <v-text-field
        v-model="address"
        :label="`${nameAdd ? nameAdd : 'Địa chỉ:'}`"
        required
      ></v-text-field>
    </v-col>
    <v-col cols="3">
      <v-select
        item-text="Name"
        item-value="Id"
        :items="Ward"
        v-bind:class="{ disabled: Ward.length ? false : true }"
        :label="`${nameWard ? nameWard : 'Phường/Xã*'}`"
        v-model="WardId"
        required
      ></v-select>
    </v-col>
    <v-col cols="3">
      <v-select
        item-text="Name"
        item-value="Id"
        :items="District"
        v-bind:class="{ disabled: District.length ? false : true }"
        :label="
          `${nameDistrict ? nameDistrict : 'Quận/Huyện/Thành phố/Thị xã*'}`
        "
        v-model="DistrictId"
        required
      ></v-select>
    </v-col>
    <v-col cols="3">
      <v-select
        item-text="Name"
        item-value="Id"
        :items="Province"
        :label="`${nameProvince ? nameProvince : 'Tỉnh/Thành phố*'}`"
        v-model="ProvinceId"
        required
      ></v-select>
    </v-col>
    <v-col cols="6">
      <v-select
        item-text="RoleName"
        item-value="Id"
        :items="roles"
        v-model="objAddUser.IdRole"
        label="Vai trò*"
        required
      ></v-select>
    </v-col>
    <v-col cols="6">
      <v-text-field
        type="number"
        label="Tài khoàn ngân hàng:"
        required
        v-model="objAddUser.BankAccountNumber"
      ></v-text-field>
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="objAddUser.BankName"
        label="Tên ngân hàng:"
        required
      ></v-text-field>
    </v-col>
    <template v-slot:m-foot>
      <v-btn color="blue darken-1" text @click="Save()">
        Save
      </v-btn>
    </template>
  </my-Modal>
</template>

<script>
import myModal from "../components/Modal.vue";

export default {
  components: { myModal },
  props: ["user", "IdProvince", "isShow", "Create"],
  data() {
    return {
      menu: false,
      objAddUser: {},
      Province: [],
      ProvinceId: null,
      ProvinceName: "",
      District: [],
      DistrictId: null,
      DistrictName: "",
      Ward: [],
      WardId: null,
      roles: [],
      nameAdd: "",
      nameProvince: "",
      nameDistrict: "",
      nameWard: "",
      WardName: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      url: "http://localhost:60189/odata",
    };
  },
  async mounted() {
    let roles = await this.getRoles();
    this.roles = roles.map((_) => {
      if (_.RoleName == "Staff") {
        _.RoleName = "Nhân Viên";
      }

      if (_.RoleName == "Administrator") {
        _.RoleName = "Admin";
      }
      return _;
    });
  },
  watch: {
    user: {
      deep: true,
      handler(val) {
        this.objAddUser = val;
        if (Object.keys(val).length != 0) {
          let address = this.objAddUser.TheAddress;
          this.nameAdd = address.split(",")[0];
          this.nameWard = address.split(",")[1];
          this.nameDistrict = address.split(",")[2];
          this.nameProvince = address.split(",")[3];
        } else {
          this.nameAdd = "";
          this.nameWard = "";
          this.nameDistrict = "";
          this.nameProvince = "";
        }
      },
    },
    async IdProvince(val) {
      this.Province = await this.getProvince();
      if (val.length) {
        this.ProvinceId = val;
      }
      this.DistrictId = null;
      this.WardId = null;
      this.District = [];
      this.Ward = [];
      this.address = "";
    },
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(val);
    },
    async ProvinceId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `${this.url}/District?$filter=ProvinceId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.District = data.value;
        }
        let respName = await this.$stores.api.get(
          `${this.url}/Province?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.ProvinceName = data.value[0].Name;
        }
      }
    },
    async DistrictId(val) {
      if (val) {
        let resp = await this.$stores.api.get(
          `${this.url}/Ward?$filter=DistrictId eq ${val}&$orderby=Name asc`
        );
        if (resp && resp.status == 200) {
          let data = await resp.json();
          this.Ward = data.value;
        }
        let respName = await this.$stores.api.get(
          `${this.url}/District?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.DistrictName = data.value[0].Name;
        }
      }
    },
    async WardId(val) {
      if (val) {
        let respName = await this.$stores.api.get(
          `${this.url}/Ward?$filter=Id eq ${val}`
        );
        if (respName && respName.status == 200) {
          let data = await respName.json();
          this.WardName = data.value[0].Type + " " + data.value[0].Name;
        }
      }
    },
  },
  methods: {
    async getProvince() {
      let resp = await this.$stores.api.get(
        `${this.url}/Province?$orderBy=Name asc`
      );
      if (resp && resp.status == 200) {
        let data = await resp.json();
        return data.value;
      }
      return null;
    },
    async getRoles() {
      let resp = await this.$stores.api.get(
        `http://localhost:60189/odata/Roles?$orderby=RoleName asc`
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
    Save() {
      let obj = JSON.parse(JSON.stringify(this.objAddUser));
      if (this.address && this.WardName && this.District && this.ProvinceName) {
        obj.TheAddress =
          this.address +
          ", " +
          this.WardName +
          ", " +
          this.DistrictName +
          ", " +
          this.ProvinceName;
      }
      obj.DateOfIssueIdNumber = this.DateOfIssueIdNumber;
      if (Object.keys(obj).length < 8) {
        obj = "";
        this.$emit("update", obj);
      } else this.$emit("update", obj);
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
