import { createRouter, createWebHistory } from "vue-router";
import BasicView from "../views/BasicView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: BasicView,
    },
    {
      path: "/animation",
      name: "animation",
      component: () => import("../views/AnimationView.vue"),
    },
    {
      path: "/cameras",
      name: "cameras",
      component: () => import("../views/CamerasView.vue"),
    },
    {
      path: "/orbit-controls",
      name: "orbit-controls",
      component: () => import("../views/OrbitControlsView.vue"),
    },
    {
      path: "/fullscreen",
      name: "fullscreen",
      component: () => import("../views/FullscreenView.vue"),
    },
    {
      path: "/geometries",
      name: "geometries",
      component: () => import("../views/GeometriesView.vue"),
    },
    {
      path: "/debug",
      name: "debug",
      component: () => import("../views/DebugView.vue"),
    },
    {
      path: "/textures",
      name: "textures",
      component: () => import("../views/TexturesView.vue"),
    },
    {
      path: "/materials",
      name: "materials",
      component: () => import("../views/MaterialsView.vue"),
    },
    {
      path: "/3d-text",
      name: "3d-text",
      component: () => import("../views/3DTextView.vue"),
    },
    {
      path: "/lights",
      name: "lights",
      component: () => import("../views/LightsView.vue"),
    },
    {
      path: "/shadows",
      name: "shadows",
      component: () => import("../views/ShadowsView.vue"),
    },
    {
      path: "/haunted-house",
      name: "haunted-house",
      component: () => import("../views/HauntedHouseView.vue"),
    },
    {
      path: "/particles",
      name: "particles",
      component: () => import("../views/ParticlesView.vue"),
    },
    {
      path: "/galaxy",
      name: "galaxy",
      component: () => import("../views/GalaxyView.vue"),
    },
    {
      path: "/raycaster",
      name: "raycaster",
      component: () => import("../views/RaycasterView.vue"),
    },
    {
      path: "/scroll",
      name: "scroll",
      component: () => import("../views/ScrollBasedView.vue"),
    },
    {
      path: "/physics",
      name: "physics",
      component: () => import("../views/PhysicsView.vue"),
    },
    {
      path: "/models",
      name: "models",
      component: () => import("../views/ModelsView.vue"),
    },
    {
      path: "/blender",
      name: "blender",
      component: () => import("../views/MyBlenderView.vue"),
    },
    {
      path: "/realistic-render",
      name: "realistic-render",
      component: () => import("../views/RealisticRenderView.vue"),
    },
    {
      path: "/fix-burger",
      name: "fix-burger",
      component: () => import("../views/FixBurgerView.vue"),
    },
    {
      path: "/big-project",
      name: "big-project",
      component: () => import("../views/BigProjectView.vue"),
    },
    {
      path: "/shaders",
      name: "shaders",
      component: () => import("../views/ShadersView.vue"),
    },
    {
      path: "/shader-patterns",
      name: "shader-patterns",
      component: () => import("../views/ShaderPatternsView.vue"),
    },
    {
      path: "/raging-sea",
      name: "raging-sea",
      component: () => import("../views/RagingSeaView.vue"),
    },
    {
      path: "/animated-galaxy",
      name: "animated-galaxy",
      component: () => import("../views/AnimatedGalaxyView.vue"),
    },
    {
      path: "/modified-materials",
      name: "modified-materials",
      component: () => import("../views/ModifiedMaterialsView.vue"),
    },
    {
      path: "/post-processing",
      name: "post-processing",
      component: () => import("../views/PostProcessingView.vue"),
    },
    {
      path: "/performance-tips",
      name: "performance-tips",
      component: () => import("../views/PerformanceTipsView.vue"),
    },
    {
      path: "/intro-loading",
      name: "intro-loading",
      component: () => import("../views/IntroAndLoadingView.vue"),
    },
    {
      path: "/mixing-html",
      name: "mixing-html",
      component: () => import("../views/MixingHTMLView.vue"),
    },
    {
      path: "/test-models",
      name: "test-models",
      component: () => import("../views/TestModelsView.vue"),
    },
    {
      path: "/import-optimize",
      name: "import-optimize",
      component: () => import("../views/ImportAndOptimizeView.vue"),
    },
    {
      path: "/adding-details",
      name: "adding-details",
      component: () => import("../views/PortalAddingDetails.vue"),
    },
    {
      path: "/ovb-testing",
      name: "ovb-testing",
      component: () => import("../views/OVBTesting.vue"),
    },
    {
      path: "/multiple-scenes",
      name: "multiple-scenes",
      component: () => import("../views/MultipleScenes.vue"),
    },
    {
      path: "/resize",
      name: "resize",
      component: () => import("../views/ResizeView.vue"),
    },
    {
      path: "/pixel-ratio",
      name: "pixel-ratio",
      component: () => import("../views/TestPixelRatio.vue"),
    },
    {
      path: "/pixel-ratio2",
      name: "pixel-ratio2",
      component: () => import("../views/TestPixelRatio2.vue"),
    },
    {
      path: "/environment-map",
      name: "environment-map",
      component: () => import("../views/EnvironmentMapView.vue"),
    },
  ],
});

export default router;
