import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin()
]

export default ({ mode }) => {
	process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

	return defineConfig({
		root,
		plugins,
		css: {
			preprocessorOptions: {}
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./client', import.meta.url))
			}
		},
		server: {
			port: process.env.VITE_PORT
		},
	})
}
