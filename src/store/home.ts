import {defineStore} from 'pinia';
export const useHomeStore = defineStore('home', {
	state: () => {
		return {
			vertMenu: false
		};
	},
	getters: {},
	actions: {
		handChangeMenu() {
			this.vertMenu = !this.vertMenu;
		}
	}
});