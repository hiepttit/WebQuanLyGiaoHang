<template>
  <v-col cols="12" md="12">
    <h1>Số lượng: {{ number }}</h1>
    <h1>Tổng: {{ total }}</h1>
    <base-material-card :color="`${color}`" class="px-5 py-3">
      <template v-slot:heading>
        <div class="display-2 font-weight-light">
          {{ header }}
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
              <template v-if="isStaff">
                <th class="primary--text">
                  Thu Nhập
                </th>
              </template>
              <template v-else>
                <th class="primary--text">
                  COD
                </th>
                <th class="primary--text">
                  Ship
                </th>
              </template>
              <th v-if="delay" class="primary--text">
                Hoãn tới
              </th>
              <th v-else class="primary--text">
                Tổng thu
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-if="stock">
              <template v-for="(item, i) in list">
                <tr
                  :key="`r${i}`"
                  :style="
                    `color: ${
                      item.TheStatus == 2
                        ? 'red'
                        : item.TheStatus == 4
                        ? 'yellow'
                        : 'green'
                    }`
                  "
                >
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.Id }}</td>
                  <td>{{ item.CustomerName }}</td>
                  <td>{{ item.TheAddress }}</td>
                  <td>{{ item.PhoneNumber }}</td>
                  <template v-if="isStaff">
                    <td>{{ item.DeliveryOrders[0].Amount }}</td>
                  </template>
                  <template v-else>
                    <td>
                      <template v-if="item.Cod > 0">
                        {{ formatNumber(item.Cod) }}
                      </template>
                      <template v-else>
                        {{ item.Cod }}
                      </template>
                    </td>
                    <td>{{ formatNumber(item.ShipFee) }}</td>
                  </template>
                  <td v-if="delay">{{ formatdelayDate(item.StockOrders) }}</td>
                  <td v-else>
                    <span v-if="item.RealReceive == null">
                      {{ formatNumber(item.ShipFee + item.Cod) }}
                    </span>
                    <span v-else>{{ formatNumber(item.RealReceive) }}</span>
                  </td>
                </tr>
              </template>
            </template>
            <template v-else>
              <template v-for="(item, i) in list">
                <tr :key="`r${i}`">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.Id }}</td>
                  <td>{{ item.CustomerName }}</td>
                  <td>{{ item.TheAddress }}</td>
                  <td>{{ item.PhoneNumber }}</td>
                  <template v-if="isStaff">
                    <td>{{ item.DeliveryOrders[0].Amount }}</td>
                  </template>
                  <template v-else>
                    <td>
                      <template v-if="item.Cod > 0">
                        {{ formatNumber(item.Cod) }}
                      </template>
                      <template v-else>
                        {{ item.Cod }}
                      </template>
                    </td>
                    <td>{{ formatNumber(item.ShipFee) }}</td>
                  </template>
                  <td v-if="delay">{{ formatdelayDate(item.StockOrders) }}</td>
                  <td v-else>
                    <span v-if="item.RealReceive == null">
                      <template v-if="item.ShipFee + item.Cod > 0">
                        {{ formatNumber(item.ShipFee + item.Cod) }}
                      </template>
                      <template v-else>
                        0
                      </template>
                    </span>
                    <span v-else>
                      <template v-if="item.RealReceive > 0">
                        {{ formatNumber(item.RealReceive) }}
                      </template>
                      <template v-else>
                        0
                      </template>
                    </span>
                  </td>
                </tr>
              </template>
              <template v-if="isStaff">
                <tr>
                  <td colspan="5"></td>
                  <td>
                    {{
                      sum(
                        list.map((_) => _.DeliveryOrders[0]),
                        "Amount"
                      )
                    }}
                  </td>
                </tr>
              </template>
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
  props: [
    "list",
    "number",
    "total",
    "header",
    "detail",
    "color",
    "delay",
    "stock",
    "isStaff",
  ],
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
    sum(array, key) {
      return array.reduce(function(r, a) {
        return r + a[key];
      }, 0);
    },
  },
};
</script>
