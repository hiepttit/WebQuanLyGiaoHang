<template>
  <v-col cols="12" md="12">
    <h1>Số lượng: {{ number }}</h1>
    <h1>Tổng: {{ total }}</h1>
    <base-material-card :color="`${color}`" class="px-5 py-3">
      <template v-slot:heading>
        <div class="display-2 font-weight-light">
          {{ header }}
          <!-- <v-card-title style="width: 200px; float: right">
            <v-text-field
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title> -->
        </div>

        <div class="subtitle-1 font-weight-light">
          {{ detail }}
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

              <th v-if="delay" class="primary--text">
                Hoãn tới
              </th>
              <th v-else class="primary--text">
                Tổng thu
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(item, i) in list">
              <tr :key="`r${i}`">
                <td>{{ i }}</td>
                <td>{{ item.Id }}</td>
                <td>{{ item.CustomerName }}</td>
                <td>{{ item.TheAddresss }}</td>
                <td>{{ item.PhoneNumber }}</td>
                <td>{{ formatNumber(item.Cod) }}</td>
                <td>{{ formatNumber(item.ShipFee) }}</td>
                <td v-if="delay">{{ formatdelayDate(item.StockOrders) }}</td>
                <td v-else>
                  <span v-if="item.RealReceive == null">
                    {{ formatNumber(item.ShipFee + item.Cod) }}
                  </span>
                  <span v-else>{{ formatNumber(item.RealReceive) }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </base-material-card>
  </v-col>
</template>
<script>
import moment from "moment";
export default {
  props: ["list", "number", "total", "header", "detail", "color", "delay"],
  methods: {
    monentDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    formatdelayDate(date) {
      if (date.length) {
        return this.monentDate(
          new Date(date[0].Delaydate).toLocaleDateString()
        );
      }
    },
    formatNumber(value) {
      if (value) {
        return value.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      }
    },
  },
};
</script>
