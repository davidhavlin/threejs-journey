<script setup lang="ts">
import Experience from "@/models/Experience/Experience";
import { onMounted, ref } from "vue";

let experience: Experience | null = null;

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvas.value) return;
  experience = new Experience(canvas.value);
});
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
.page .wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
