<template>
  <div class="custom-control" @click="!isDisable && $emit('input', !value)">
    <input
      type="checkbox"
      class="custom-control-input"
      v-model="value"
      :disabled="isDisable"
    />
    <label class="custom-control-label">
      <slot />
    </label>
  </div>
</template>
<script>
export default {
  props: ["value", "isDisable"],
};
</script>
