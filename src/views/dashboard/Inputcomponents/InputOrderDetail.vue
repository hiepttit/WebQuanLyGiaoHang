<template>
  <my-Modal :show="isShow" :title="'Tạo người dùng'" @close="$emit('close')">
    <v-col cols="12" sm="6" md="6">
      <v-combobox
        item-text="CustomerName"
        item-value="CustomerName"
        :items="Code"
        label="Họ tên khách hàng:*"
        dense
        outlined
        v-model="objAddOrder.CustomerName"
        required
      ></v-combobox>
    </v-col>
    <v-col cols="12" sm="6" md="6">
      <v-combobox
        item-text="PhoneNumber"
        item-value="PhoneNumber"
        :items="Code"
        label="Số điện thoại:*"
        dense
        outlined
        v-model="objAddOrder.PhoneNumber"
        required
        type="number"
      ></v-combobox>
    </v-col>
    <v-col cols="3">
      <v-text-field v-model="address" label="Địa chỉ:" required></v-text-field>
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
        v-model="WardId"
        required
      ></v-select>
    </v-col>
    <v-col cols="6">
      <v-text-field
        type="number"
        label="COD:"
        required
        v-model="objAddOrder.Cod"
      ></v-text-field>
    </v-col>
    <v-col cols="6">
      <v-text-field
        type="number"
        label="Ship:"
        required
        v-model="objAddOrder.ShipFee"
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
  props: ["user", "IdProvince", "isShow"],
  data() {
    return {
      menu: false,
      objAddOrder: {},
      Province: [],
      ProvinceId: null,
      ProvinceName: "",
      District: [],
      DistrictId: null,
      DistrictName: "",
      Ward: [],
      WardId: null,
      roles: [],
      WardName: "",
      DateOfIssueIdNumber: new Date().toISOString().substr(0, 10),
      dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
      address: "",
      url: "http://localhost:60189/odata",
    };
  },
  async mounted() {
    this.roles = await this.getRoles();
    this.Province = await this.getProvince();
  },
  watch: {
    user: {
      deep: true,
      handler(val) {
        this.objAddOrder = val;
      },
    },
    async IdProvince(val) {
      if (val) {
        this.Province = await this.getProvince();
        this.ProvinceId = val;
        this.DistrictId = null;
        this.WardId = null;
        this.District = [];
        this.Ward = [];
        this.address = "";
      }
    },
    DateOfIssueIdNumber(val) {
      this.dateFormatted = this.formatDate(this.DateOfIssueIdNumber);
    },
    async ProvinceId(val) {
      if (val != 0) {
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
      let obj = JSON.parse(JSON.stringify(this.objAddOrder));
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
      if (Object.keys(obj).length < 5) {
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
