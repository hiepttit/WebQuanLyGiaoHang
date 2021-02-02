<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="1000px">
      <v-card>
        <slot :name="`m-head`">
          <v-card-title>
            <span class="headline" v-if="titleModal">
              <label>{{ titleModal }}</label>
            </span>
            <a
              style="float:right;text-decoration:none"
              href="javascript:"
              @click="closeModal()"
            >
              X
            </a>
          </v-card-title>
        </slot>
        <v-card-text>
          <v-container>
            <v-row><slot></slot></v-row>
          </v-container>
          <small>*Các trường bắt buộc</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeModal()">
            Close
          </v-btn>
          <slot :name="`m-foot`"></slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
  props: ["show", "title"],
  data: () => ({}),
  computed: {
    titleModal() {
      if (this.title) {
        return this.title;
      }
      return null;
    },
  },
  methods: {
    closeModal() {
      this.$emit(`close`);
    },
  },
};
</script>
