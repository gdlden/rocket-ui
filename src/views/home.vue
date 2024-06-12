<template>
	<v-header />
	<v-sidebar v-if="changeMenu" />
	<el-card class="content-box" :class="{ 'content-collapse': sidebar.collapse }">
		<v-tags></v-tags>
		<el-card class="content">
			<router-view v-slot="{ Component }">
				<transition name="move" mode="out-in">
					<keep-alive :include="tags.nameList">
						<component :is="Component"></component>
					</keep-alive>
				</transition>
			</router-view>
		</el-card>
	</el-card>
</template>
<script setup lang="ts">
import { useSidebarStore } from '../store/sidebar';
import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
import vTags from '../components/tags.vue';
import { computed,onMounted, ref } from "vue";

const sidebar = useSidebarStore();
const tags = useTagsStore();


const changeMenu=ref();

const  changeMenuFunc= ()=>{
	changeMenu.value =!changeMenu.value;
}

// changeMenuFunc()

</script>
