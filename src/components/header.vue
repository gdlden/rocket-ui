<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div v-if="homeStore.vertMenu" class="collapse-btn" @click="collapseChage">
      <el-icon v-if="sidebar.collapse">
        <Expand />
      </el-icon>
      <el-icon v-else>
        <Fold />
      </el-icon>
    </div>
    <div class="logo">Rocket PT</div>

    <div class="header-center">
      <el-input
        v-model="keyword"
        class="search-box"
        placeholder="搜索..."
        @keyup.enter.native="searchTorrent"
        :prefix-icon="Search"
        clearable
      />
    </div>
    <div class="header-center" >

    <el-menu
        class="header-el-menu"
        mode="horizontal"
        :default-active="onRoutes"
        background-color="#242f42"
        text-color="#fff"
        active-text-color="#fff"
        unique-opened
        style="border-bottom:none"
        router
    v-if="!homeStore.vertMenu"
        >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index">
            <template #title>
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-sub-menu
                  v-if="subItem.subs"
                  :index="subItem.index"
                  :key="subItem.index"
              >
                <template #title>
                  <el-icon>
                    <component :is="subItem.icon"></component>
                  </el-icon>
                  {{ subItem.title }}
                </template>
                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                  <el-icon>
                    <component :is="threeItem.icon"></component>
                  </el-icon>
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                <el-icon>
                  <component :is="subItem.icon"></component>
                </el-icon>
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item?.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
    </div>
    



    <div class="header-right">
      <div class="header-user-con">
        <!-- 消息中心 -->
        <div class="btn-bell" @click="router.push('/tabs')">
          <el-tooltip
            effect="dark"
            :content="message ? `有${message}条未读消息` : `消息中心`"
            placement="bottom"
          >
            <i class="el-icon-lx-notice"></i>
          </el-tooltip>
          <span class="btn-bell-badge" v-if="message"></span>
        </div>
        <!-- dark -->
        <el-button link @click="toggleDark()">
          <el-icon v-if="isDark" size="22px" color="#fff">
            <Moon />
          </el-icon>
          <el-icon v-else size="22px" color="#fff">
            <Sunny />
          </el-icon>
        </el-button>
        <el-button link @click="changeMenu()">
          <el-icon size="22px" color="#fff">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 448 512"><path d="M12.83 352h262.34A12.82 12.82 0 0 0 288 339.17v-38.34A12.82 12.82 0 0 0 275.17 288H12.83A12.82 12.82 0 0 0 0 300.83v38.34A12.82 12.82 0 0 0 12.83 352zm0-256h262.34A12.82 12.82 0 0 0 288 83.17V44.83A12.82 12.82 0 0 0 275.17 32H12.83A12.82 12.82 0 0 0 0 44.83v38.34A12.82 12.82 0 0 0 12.83 96zM432 160H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0 256H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" fill="currentColor"></path></svg>
        </el-icon>
        </el-button>
        <!-- 用户头像 -->
        <el-avatar class="user-avator" :size="30" :src="avatar" />
        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <!--              <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                              <el-dropdown-item>项目仓库</el-dropdown-item>
                            </a>-->
              <el-dropdown-item command="user">个人中心</el-dropdown-item> 
              <el-dropdown-item divided command="loginout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed,onMounted, ref } from "vue";
import { Moon, Search, Sunny } from "@element-plus/icons-vue";
import { useSidebarStore } from "../store/sidebar";
import { useHomeStore } from "../store/home";
import { useRouter } from "vue-router";
import {useRoute} from 'vue-router';
import { logout } from "../api/login";
import { useBasicStore } from "../store/basic";
import { useDark, useToggle } from "@vueuse/core";
import {getMenus} from "../api/resource";

const route = useRoute();

const homeStore = useHomeStore();
const onRoutes = computed(() => {
  return route.path;
});

interface MenuItem {
  index: string;
  icon: string;
  title: string;
  subs: MenuItem[] | undefined;
}

const items = ref<MenuItem[]>([]);

getMenus().then(res => {
  items.value = getDataNode(res.data.data, 0);
});

const getDataNode: any = (menus: any[], parentId: number) => {
  return menus.filter(m => m.parentId === parentId).map((menu: any) => {
    let subs: MenuItem[] = getDataNode(menus, menu.id);
    return {
      index: menu.url,
      icon: menu.icon,
      title: menu.name,
      subs: subs?.length === 0 ? undefined : subs
    }
  });
}




const keyword = ref("");
const userinfoStore = useBasicStore();
const userinfo = userinfoStore.userinfo;
const username: string | null = userinfo.fullName;
const avatar: string | null = userinfo.avatar;
const message: number = 2;

const sidebar = useSidebarStore();

const isDark = useDark();
const toggleDark = useToggle(isDark);
const vertMenu = ref(true)
const changeMenu = ()=>{
  homeStore.handChangeMenu();
}

// 侧边栏折叠
const collapseChage = () => {
  sidebar.handleCollapse();
};

// 侧边栏折叠
const searchTorrent = () => {
  console.log("搜索torrent：" + keyword.value);
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
});

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
  if (command == "loginout") {
    logout().then(() => {
      toggleDark(false);
      localStorage.removeItem("token");
      router.push("/login");
    });
  } else if (command == "user") {
    router.push("/user");
  }
};
</script>
<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  font-size: 22px;
  color: #fff;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  float: left;
  padding: 0 21px;
  cursor: pointer;
}

.header .logo {
  float: left;
  width: 250px;
  line-height: 70px;
}

.header-center {
  float: left;
  line-height: 70px;
}
.header-right {
  float: right;
  padding-right: 50px;
}

.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}

.btn-fullscreen {
  transform: rotate(45deg);
  margin-right: 5px;
  font-size: 24px;
}

.btn-bell,
.btn-fullscreen {
  position: relative;
  width: 30px;
  height: 30px;
  text-align: center;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-bell-badge {
  position: absolute;
  right: 4px;
  top: 0px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
}

.btn-bell .el-icon-lx-notice {
  color: #fff;
}

.user-name {
  margin-left: 10px;
}

.user-avator {
  margin-left: 20px;
}

.el-dropdown-link {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-dropdown-menu__item {
  text-align: center;
}

.search-box {
  margin: 0 auto;
  width: 320px;
}
</style>
