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
        <base-material-card color="warning" class="px-5 py-3">
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Employees Stats
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
            <v-data-table :search="search" :headers="headers" :items="items" />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
    <my-Modal :dialog="isShow" @close="isShow = false"></my-Modal>
  </v-container>
</template>

<script>
import myModal from "../components/core/Modal";

export default {
  components: { myModal },
  name: "DataTable",

  data() {
    return {
      isShow: false,
      search: "",
      headers: [
        {
          sortable: false,
          text: "ID",
          value: "id"
        },
        {
          sortable: false,
          text: "Name",
          value: "name"
        },
        {
          sortable: false,
          text: "Salary",
          value: "salary",
          align: "right"
        },
        {
          sortable: false,
          text: "Country",
          value: "country",
          align: "right"
        },
        {
          sortable: false,
          text: "City",
          value: "city",
          align: "right"
        }
      ],
      items: [
        {
          id: 1,
          name: "Dakota Rice",
          country: "Niger",
          city: "Oud-Tunrhout",
          salary: "$35,738"
        },
        {
          id: 2,
          name: "Minerva Hooper",
          country: "Curaçao",
          city: "Sinaai-Waas",
          salary: "$23,738"
        },
        {
          id: 3,
          name: "Sage Rodriguez",
          country: "Netherlands",
          city: "Overland Park",
          salary: "$56,142"
        },
        {
          id: 4,
          name: "Philip Chanley",
          country: "Korea, South",
          city: "Gloucester",
          salary: "$38,735"
        },
        {
          id: 5,
          name: "Doris Greene",
          country: "Malawi",
          city: "Feldkirchen in Kārnten",
          salary: "$63,542"
        }
      ]
    };
  },

  methods: {}
};
</script>
