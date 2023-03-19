<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="wrapper">
        <HelloWorld msg="Three.js" />

        <nav>
          <RouterLink to="/">Basic</RouterLink>
          <RouterLink to="/animation">Animation</RouterLink>
          <RouterLink to="/cameras">Cameras</RouterLink>
          <RouterLink to="/orbit-controls">Cameras - OrbitControls</RouterLink>
          <RouterLink to="/fullscreen">Fullscreen</RouterLink>
          <RouterLink to="/geometries">Geometries</RouterLink>
          <RouterLink to="/debug">Debug</RouterLink>
          <RouterLink to="/textures">Textures</RouterLink>
          <RouterLink to="/materials">Materials</RouterLink>
          <RouterLink to="/3d-text">3D Text</RouterLink>
          <RouterLink to="/lights">Lights</RouterLink>
          <RouterLink to="/shadows">Shadows</RouterLink>
          <RouterLink to="/haunted-house">Haunted House</RouterLink>
          <RouterLink to="/particles">Particles</RouterLink>
          <RouterLink to="/galaxy">Galaxy</RouterLink>
          <RouterLink to="/raycaster">Raycaster</RouterLink>
          <RouterLink to="/scroll">Scroll Based Anim</RouterLink>
          <RouterLink to="/physics">Physics</RouterLink>
          <RouterLink to="/models">Models</RouterLink>
          <RouterLink to="/blender">My Blender</RouterLink>
          <RouterLink to="/fix-burger">Fix Burger</RouterLink>
          <RouterLink to="/realistic-render">Realistic Render</RouterLink>
          <RouterLink to="/big-project">Big Project</RouterLink>
          <RouterLink to="/shaders">Shaders</RouterLink>
          <RouterLink to="/shader-patterns">Shader Patterns</RouterLink>
          <RouterLink to="/raging-sea">Raging Sea</RouterLink>
          <RouterLink to="/animated-galaxy">Animated Galaxy</RouterLink>
          <RouterLink to="/modified-materials">Modified Materials</RouterLink>
          <RouterLink to="/post-processing">Post Processing</RouterLink>
          <RouterLink to="/performance-tips">Performance Tips</RouterLink>
          <RouterLink to="/intro-loading">Intro and Loading progress</RouterLink>
          <RouterLink to="/mixing-html">Mixing HTML and WEBGL</RouterLink>
          <RouterLink to="/test-models">Test Models</RouterLink>
          <RouterLink to="/import-optimize">Import and Optimize</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  z-index: 10;
}

.page {
  /* display: flex; */
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
