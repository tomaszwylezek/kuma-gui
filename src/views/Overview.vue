<template>
  <div class="overview">
    <div :class="chartContainerClass">
      <DonutChart
        v-if="selectedMesh === 'all'"
        :class="chartClass"
        :title="{ singular: 'ZONE', plural: 'ZONES' }"
        :data="zonesChart.data"
        :url="{ name: 'zones' }"
        :is-loading="areZonesInsightsLoading"
      />
      <DonutChart
        :class="chartClass"
        :title="{ singular: 'SERVICE', plural: 'SERVICES' }"
        :data="servicesChart.data"
        :is-loading="areServicesLoading"
        save-chart
      />
      <DonutChart
        :class="chartClass"
        :title="{ singular: 'DP PROXY', plural: 'DP PROXIES' }"
        :data="dataplanesChart.data"
        :url="{ name: 'dataplanes' }"
        :is-loading="areMeshInsightsLoading"
      />
      <VersionsDonutChart
        v-if="selectedMesh === 'all'"
        :class="chartClass"
        title="ZONE CP"
        :data="zonesCPVersionsChart.data"
        :is-loading="areZonesInsightsLoading"
      />
      <VersionsDonutChart
        :class="chartClass"
        title="KUMA DP"
        :data="kumaDPVersionsChart.data"
        :is-loading="areMeshInsightsLoading"
      />
      <VersionsDonutChart
        :class="chartClass"
        title="ENVOY"
        :data="envoyVersionsChart.data"
        :is-loading="areMeshInsightsLoading"
        display-am-charts-logo
      />
    </div>

    <!-- metrics boxes -->
    <MetricGrid
      :metrics="overviewMetrics"
    />

    <div class="card-wrapper card-wrapper--4-col">
      <div>
        <CardSkeleton
          class="card-item"
          :card-action-route="{ name: 'create-mesh' }"
          card-title="Create a virtual Mesh"
          card-action-button-text="Create Mesh"
        >
          <template slot="cardContent">
            <p>
              We can create multiple isolated Mesh resources (i.e. per application/team/business unit).
            </p>
          </template>
        </CardSkeleton>
      </div>
      <div>
        <CardSkeleton
          class="card-item"
          :card-action-route="dataplaneWizardRoute"
          card-title="Connect data plane proxies"
          card-action-button-text="Get Started"
        >
          <template slot="cardContent">
            <p>
              We need a data plane proxy for each replica of our services within a Mesh resource.
            </p>
          </template>
        </CardSkeleton>
      </div>
      <div>
        <CardSkeleton
          class="card-item"
          :card-action-route="cardActionPoliciesRoute"
          :card-title="`Apply ${title} policies`"
          card-action-button-text="Explore Policies"
        >
          <template slot="cardContent">
            <p>
              We can apply {{ $productName }} policies to secure, observe, route and manage the Mesh and its data plane proxies.
            </p>
          </template>
        </CardSkeleton>
      </div>
      <div>
        <Resources class="card-item" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import MetricGrid from '@/components/Metrics/MetricGrid.vue'
import CardSkeleton from '@/components/Skeletons/CardSkeleton'
import Resources from '@/components/Resources'
import DonutChart from '@/components/DonutChart'
import VersionsDonutChart from '@/components/VersionsDonutChart'

export default {
  name: 'Overview',
  metaInfo () {
    return {
      title: this.$route.meta.title
    }
  },
  components: {
    DonutChart,
    VersionsDonutChart,
    MetricGrid,
    CardSkeleton,
    Resources
  },
  computed: {
    ...mapGetters({
      title: 'config/getTagline',
      environment: 'config/getEnvironment',
      selectedMesh: 'getSelectedMesh',
      multicluster: 'config/getMulticlusterStatus',
      meshInsight: 'getMeshInsight',
      areMeshInsightsLoading: 'getMeshInsightsFetching',
      areZonesInsightsLoading: 'getZonesInsightsFetching',
      areServicesLoading: 'getServiceResourcesFetching',
      getChart: 'getChart',
    }),
    cardActionPoliciesRoute () {
      return `https://kuma.io/policies/${process.env.VUE_APP_UTM}`
    },
    dataplanesChart () {
      return this.getChart('dataplanes')
    },
    servicesChart () {
      return this.getChart('services')
    },
    zonesChart () {
      return this.getChart('zones')
    },
    zonesCPVersionsChart () {
      return this.getChart('zonesCPVersions')
    },
    kumaDPVersionsChart () {
      return this.getChart('kumaDPVersions')
    },
    envoyVersionsChart () {
      return this.getChart('envoyVersions')
    },
    pageTitle () {
      const metaTitle = this.$route.meta.title
      const mesh = this.selectedMesh

      return mesh === 'all'
        ? `${metaTitle} for all Meshes`
        : `${metaTitle} for ${mesh}`
    },
    zonesForChart () {
      return this.multicluster
        ? this.$store.state.totalClusters
        : 1
    },
    overviewMetrics () {
      const mesh = this.selectedMesh
      const { policies, meshesTotal } = this.meshInsight

      const tableData = [
        {
          metric: 'Meshes',
          value: meshesTotal,
          url: `/meshes/${mesh}`,
        },
        {
          metric: 'Circuit Breakers',
          value: policies.CircuitBreaker.total,
          url: `/${mesh}/circuit-breakers`,
        },
        {
          metric: 'Fault Injections',
          value: policies.FaultInjection.total,
          url: `/${mesh}/fault-injections`,
        },
        {
          metric: 'Health Checks',
          value: policies.HealthCheck.total,
          url: `/${mesh}/health-checks`,
        },
        {
          metric: 'Proxy Templates',
          value: policies.ProxyTemplate.total,
          url: `/${mesh}/proxy-templates`,
        },
        {
          metric: 'Traffic Logs',
          value: policies.TrafficLog.total,
          url: `/${mesh}/traffic-logs`,
        },
        {
          metric: 'Traffic Permissions',
          value: policies.TrafficPermission.total,
          url: `/${mesh}/traffic-permissions`,
        },
        {
          metric: 'Traffic Routes',
          value: policies.TrafficRoute.total,
          url: `/${mesh}/traffic-routes`,
        },
        {
          metric: 'Traffic Traces',
          value: policies.TrafficTrace.total,
          url: `/${mesh}/traffic-traces`,
        },
        {
          metric: 'Rate Limits',
          value: policies.RateLimit.total,
          url: `/${mesh}/rate-limits`,
        },
        {
          metric: 'Retries',
          value: policies.Retry.total,
          url: `/${mesh}/retries`,
        },
        {
          metric: 'Timeouts',
          value: policies.Timeout.total,
          url: `/${mesh}/timeouts`,
        },
      ]

      if (mesh !== 'all') {
        // if the user is viewing the overview with a mesh selected,
        // we hide these items from the metrics grid.
        return tableData.filter(({ metric }) => metric !== 'Meshes')
      }

      return tableData
    },
    dataplaneWizardRoute () {
      // we change the route to the Dataplane
      // wizard based on environment.
      const name = this.environment === 'universal'
        ? 'universal-dataplane'
        : 'kubernetes-dataplane'

      return { name }
    },
    chartClass () {
      const isAll = this.selectedMesh === 'all'

      return [
        'flex',
        'flex-1',
        'md:flex-1/2',
        isAll && 'xl:flex-1/3',
        !isAll && 'xl:flex-1',
        'md:w-1/2',
        isAll && 'xl:w-1/3',
        !isAll && 'xl:w-auto'
      ].filter(item => item).join(' ')
    },
    chartContainerClass () {
      const isAll = this.selectedMesh === 'all'

      return [
        'flex',
        'flex-col',
        'md:flex-row',
        'md:flex-wrap',
        isAll && 'md:h-540p',
        !isAll && 'md:h-360p',
        isAll && 'xl:h-360p',
        !isAll && 'xl:h-180p',
        'my-2',
        'py-2',
      ].filter(item => item).join(' ')
    },
  },
  watch: {
    selectedMesh () {
      this.init()
    },
  },
  beforeMount () {
    this.init()
  },
  methods: {
    ...mapActions([
      'fetchMeshInsights',
      'fetchTotalClusterCount',
      'fetchZonesInsights',
      'fetchServices',
    ]),
    init () {
      this.fetchMeshInsights(this.selectedMesh)
      this.fetchServices(this.selectedMesh)
      this.fetchZonesInsights(this.multicluster)

      if (this.multicluster) {
        this.fetchTotalClusterCount()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.empty-state-title {

  .card-icon {
    text-align: center;

    img, svg {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
  }
}

.card-wrapper {

  @media only screen and (max-width: 840px) {
    .card-item {
      margin-bottom: 0.5rem;
    }
  }

  @media only screen and (min-width: 841px) {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.5rem 0;

    &.card-wrapper--4-col {
      --i: 50%;
    }

    &.card-wrapper--2-col {
      --i: 50%;
    }

    > * {
      flex: 0 0 var(--i);
      max-width: var(--i);
    }

    .card-item {
      --i: 16px;
      --x: calc(var(--i) / 2);
      margin: 0 var(--x) var(--i) var(--x);
    }
  }

  @media only screen and (min-width: 1270px) {
    &.card-wrapper--4-col {
      --i: 25%;
    }
  }
}

@responsive {
  .h-180p {
    height: 180px;
  }

  .h-360p {
    height: 360px;
  }

  .h-540p {
    height: 540px;
  }

  .flex-1 {
    flex: 1 1 0;
  }

  .flex-1\/2 {
    flex: 1 1 50%;
  }

  .flex-1\/3 {
    flex: 1 1 33%;
  }
}

// v-deep is a deep selector which is equivalent of ">>>" as sass loader is not
//  able to properly parse ">>>"
// ref:
//  https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors
::v-deep .pie-chart-label {
  @apply tracking-widest uppercase
}
</style>
