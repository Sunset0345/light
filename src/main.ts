
/// <reference path="./shims-vue.d.ts" />

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'

/* Core CSS */
import '@ionic/vue/css/core.css'

/* Basic Ionic CSS */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional Ionic CSS */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Ionic Dark Mode */
import '@ionic/vue/css/palettes/dark.system.css'

/* Theme Variables */
import './theme/variables.css'

/* Initialize Ionic Vue */
const app = createApp(App)
  .use(IonicVue)
  .use(router)

/* Mount Application */
router.isReady().then(() => {
  app.mount('#app')
})
