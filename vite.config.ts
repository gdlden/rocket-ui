import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

export default defineConfig({
	base: './',
	plugins: [
		vue(),
		VueSetupExtend(),
		AutoImport({
			resolvers: [ElementPlusResolver()]
		}),
		Components({
			resolvers: [ElementPlusResolver()]
		})
	],
	server: {
		host: '0.0.0.0',
		cors: true,
		proxy: {
			'/api': {
				changeOrigin: true,
				target: `http://rocketpt.plexpt.com/api`,
			},
		},
	},
	optimizeDeps: {
		include: ['schart.js']
	}
});
