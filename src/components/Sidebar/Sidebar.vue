<template>
  <aside
    id="the-sidebar"
    class="has-subnav"
    :class="[
      { 'is-collapsed': isCollapsed },
      { 'subnav-expanded': subnavIsExpanded },
    ]"
  >
    <div
      ref="sidebarControl"
      class="main-nav"
      :class="{ 'is-hovering': isHovering || subnavIsExpanded === false }"
    >
      <div class="top-nav">
        <NavItem
          v-for="(item, idx) in titleNavItems"
          :key="idx"
          v-bind="item"
          has-custom-icon
          @click.native="toggleSubnav"
        >
          <template
            v-if="item.iconCustom && !item.icon"
            slot="item-icon"
          >
            <div v-html="item.iconCustom" />
          </template>
        </NavItem>
      </div>
      <div class="bottom-nav">
        <NavItem
          v-for="(item, idx) in bottomNavItems"
          :key="idx"
          v-bind="item"
          has-icon
        />
      </div>
    </div>
    <Subnav
      v-if="subnavIsExpanded"
      :title="titleNavItems[0].name"
      :title-link="titleNavItems[0].link"
      :items="topNavItems"
    >
      <template slot="top">
        <MeshSelector :items="meshList" />
      </template>
    </Subnav>
  </aside>
</template>

<script>
import NavItem from '@/components/Sidebar/NavItem'
import Subnav from '@/components/Sidebar/Subnav'
import MeshSelector from '@/components/Utils/MeshSelector'

import { mapState } from 'vuex'

export default {

  name: 'Sidebar',
  components: {
    MeshSelector,
    NavItem,
    Subnav,
  },

  data() {
    return {
      isCollapsed: false,
      sidebarSavedState: null,
      toggleWorkspaces: false,
      isHovering: false,
      subnavIsExpanded: true,
    }
  },

  computed: {

    ...mapState('sidebar', {
      menu: (state) => state.menu,
    }),

    titleNavItems() {
      return this.menu.find((i) => i.position === 'top').items
    },

    topNavItems() {
      return this.menu.find((i) => i.position === 'top').items[0].subNav.items
    },

    bottomNavItems() {
      return this.menu.find((i) => i.position === 'bottom').items
    },

    hasSubnav() {
      return Boolean(this.selectedMenuItem?.subNav?.items?.length)
    },

    lastMenuList() {
      return Object.keys(this.menuList.sections).length - 1
    },

    meshList() {
      return this.$store.state.meshes
    },

    selectedMenuItem() {
      const route = this.$route

      for (const section of this.menu) {
        for (const item of section.items) {
          const urlPath = route.path.split('/')[2]
          const isNotRootLevelMenuItem = route.name !== item.link
          const matchesUrlPath = urlPath === item.link

          // const conditions = matchesUrlPath &&
          //   isNotRootLevelMenuItem &&
          //   item.subNav &&
          //   !route.meta.hideSubnav

          const conditions = isNotRootLevelMenuItem && !route.meta.hideSubnav

          if (conditions) {
            return item
          }
        }
      }

      return null
    },

    touchDevice() {
      return !!('ontouchstart' in window || navigator.maxTouchPoints)
    },
  },

  mounted() {
    // const app = this.$appWindow

    // if (app.innerWidth <= 900) {
    //   this.isCollapsed = true
    // } else {
    //   this.isCollapsed = false
    // }

    // window.addEventListener('resize', this.handleResize)

    // this.subnavIsExpanded = localStorage.sidebarCollapsed === 'true'

    this.sidebarEvent()
  },

  beforeDestroy() {
    // window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    getNavItems(menu, position, items) {
      return menu.find((i) => i.position === position).items
    },

    handleResize() {
      // const sidebarState = getItemFromStorage('sidebarCollapsed')
      const appWidth = this.$appWindow.innerWidth

      if (appWidth <= 900) {
        this.isCollapsed = true
        this.subnavIsExpanded = false
        this.isHovering = false
      }

      if (appWidth >= 900) {
        this.isCollapsed = false
        this.isHovering = true
      }
    },

    toggleSubnav() {
      /**
       * we want to make sure that when the user clicks one of the
       * parent items, the subnav is expanded and kept that way.
       * this reduces the amount of clicks for the user and keeps the
       * subnav items accessible.
       */
      // this.subnavIsExpanded = !this.subnavIsExpanded
      this.subnavIsExpanded = true
      this.isCollapsed = true

      localStorage.setItem('sidebarCollapsed', this.subnavIsExpanded)
    },

    sidebarEvent() {
      // determine if the user is on a touch or non-touch device
      // and then use the proper events accordingly.
      const hasTouch = this.touchDevice
      const el = this.$refs.sidebarControl

      // if the route instructs the sidebar to be expanded, handle it
      if (
        this.$route.params.expandSidebar &&
        this.$route.params.expandSidebar === true
      ) {
        this.subnavIsExpanded = true
        localStorage.setItem('sidebarCollapsed', true)
      }

      if (hasTouch) {
        el.addEventListener('touchstart', () => {
          this.isHovering = true
        })

        el.addEventListener('touchend', () => {
          this.isHovering = false
        })
      } else {
        el.addEventListener('mouseover', () => {
          this.isHovering = true
        })

        el.addEventListener('mouseout', () => {
          this.isHovering = false
        })

        el.addEventListener('click', () => {
          this.isHovering = false
        })
      }
    },
  },
}
</script>

<style lang="scss">
#the-sidebar {
  position: fixed;
  z-index: 10;
  top: var(--headerHeight);
  left: 0;
  display: flex;
  height: calc(100vh - 3rem);
  color: var(--blue-700);

  .nav-icon {
    svg:not([class]) {
      display: block;
      margin: 0;
      width: 18px;
      height: 18px;

      circle {
        fill: var(--SidebarIconColor);
      }

      path {
        stroke: var(--SidebarIconColor);
      }
    }
  }

  &.has-subnav {
    width: calc(var(--sidebarCollapsedWidth) + var(--subnavWidth));

    &.subnav-expanded {
      .main-nav.is-hovering {
        box-shadow: 0 20px 25px -5px var(--black-10),
          0 10px 10px -5px var(--black-10);
      }
    }

    .main-nav {
      width: var(--sidebarCollapsedWidth);
      z-index: 1100;

      &.is-hovering {
        // max-width: max-content;
        // width: calc(var(--subnavWidth) + 1rem);
        width: var(--subnavWidth);
        cursor: pointer;
        // box-shadow: 0 20px 25px -5px var(--black-10), 0 10px 10px -5px var(--black-10);
      }
    }
  }

  .main-nav {
    position: relative;
    display: flex;
    flex-direction: column;
    width: var(--sidebarOpenWidth);
    padding: 1.5rem 0 2rem;
    background-color: var(--sidebarBackground);
    transition: var(--transitionTiming) width var(--transition);

    .top-nav {
      margin-bottom: auto;
    }
  }

  & + .main-content {
    // margin-left: var(--sidebarCollapsedWidth);
    margin-left: var(--sidebarOpenWidth);
  }

  &.subnav-expanded + .main-content {
    margin-left: calc(var(--sidebarCollapsedWidth) + var(--subnavWidth));
  }

  .no-pointer-events {
    pointer-events: none;
  }

  // Move content over
  // @media only screen and (max-width: 800px) {
  //   & + .main-content {
  //     margin-left: var(--sidebarOpenWidth);
  //   }

  //   &.subnav-expanded + .main-content {
  //     margin-left: calc(var(--sidebarCollapsedWidth) + var(--subnavWidth));
  //   }
  // }
}
</style>
