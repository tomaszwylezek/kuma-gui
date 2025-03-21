import Vue from 'vue'
import Vuex from 'vuex'
import App from '@/App.vue'
import Router from '@/router'
import { datadogLogs } from '@datadog/browser-logs'
import VueMeta from 'vue-meta'
import Store from '@/store'
import axios from 'axios'
import Kuma from '@/services/kuma'
import configUrl from '@/configUrl'

/** amCharts */
import * as am4core from '@amcharts/amcharts4/core'
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

/** Kongponents */
import './kongponents'

/** Tailwind */
import '@/assets/styles/third-party/tailwind.css'

/** Styles */
import '@/assets/styles/variables.scss'
import '@/assets/styles/utilities.scss'
import '@/assets/styles/fonts.scss'
import '@/assets/styles/main.scss'
import '@/assets/styles/typography.scss'
import '@/assets/styles/inputs.scss'
import '@/assets/styles/components.scss'
import '@/assets/styles/transitions.scss'

/** Initiate Datadog */

if (process.env.NODE_ENV === 'production') {
  datadogLogs.init({
    clientToken: 'pub94a0029259f79f29a5d881a06d1e9653',
    site: 'datadoghq.com',
    forwardErrorsToLogs: true,
    service: process.env.VUE_APP_NAMESPACE,
    sampleRate: 100,
    env: process.env.NODE_ENV
  })
}

/** Initiate plugins */
Vue.use(VueMeta)

Vue.config.productionTip = false

am4core.useTheme(am4themesAnimated)

/**
 * APP SETUP
 */

/** the app itself */
function VUE_APP () {
  const kuma = new Kuma()

  // setup the product namespace
  Vue.prototype.$productName = process.env.VUE_APP_NAMESPACE

  // setup the HTTP API namespace
  Vue.prototype.$api = kuma

  // define the page size globally for fetching
  // API item count on table views
  Vue.prototype.$pageSize = 12

  Vue.prototype.$appWindow = window

  const store = new Vuex.Store(Store(kuma))
  const router = Router()

  new Vue({
    store,
    router,
    render: h => h(App)
  }).$mount('#app')
}

/** bootstrapping to run our Vue app */
function SETUP_VUE_APP () {
  /**
   * Always check the Kuma environment and api URL in storage
   * and update it upon GUI launch.
   */

  axios
    .get(configUrl())
    .then(response => {
      const kumaEnv = response.data.environment

      const storedKumaEnv = localStorage.getItem('kumaEnv') !== null
        ? localStorage.getItem('kumaEnv')?.toString()
        : null

      /**
       * Always check the API URL and set it accordingly for the app to access.
       */
      let apiUrl = response.data.guiServer.apiServerUrl

      if (apiUrl === '') {
        const url = window.location.href

        /**
         * If we're running in development mode, we have to ensure
         * we fetch from the external Kuma API URL and not from the app
         * root itself (since it runs from :8080).
         */
        if (process.env.NODE_ENV === 'development') {
          apiUrl = process.env.VUE_APP_KUMA_CONFIG?.replace('/config', '/')
        } else {
          apiUrl = url.substring(0, url.indexOf('/gui')) + '/'
        }
      }

      localStorage.setItem('kumaApiUrl', apiUrl)

      /**
       * If there is a mismatch between the Kuma environment value
       * in the config endpoint and localStorage, send the user
       * back through the onboarding process.
       */
      if (!storedKumaEnv || storedKumaEnv !== kumaEnv) {
        localStorage.setItem('kumaOnboardingComplete', 'false')
        localStorage.setItem('kumaEnv', kumaEnv)
      }
    })
    .then(() => {
      /**
       * Now that the foundation is set, move forward and launch the app.
       */
      VUE_APP()
    })
    .catch(error => {
      /** in the rare instance that we can't even load the /config endpoint. */
      VUE_APP()

      /** clear out any localStorage values */
      localStorage.removeItem('kumaApiUrl')
      localStorage.removeItem('kumaOnboardingComplete')
      localStorage.removeItem('kumaEnv')
      localStorage.removeItem('selectedMesh')

      console.error('There was a problem loading the config. Please try restarting Kuma.')

      console.error(error)
    })
}

/**
 * Now we can run our app
 */
SETUP_VUE_APP()

if (process.env.VUE_APP_AMCHARTS_LICENSE) {
  am4core.addLicense(process.env.VUE_APP_AMCHARTS_LICENSE)
}
