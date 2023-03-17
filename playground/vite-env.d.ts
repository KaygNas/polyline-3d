/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

declare module '*.glsl' {
	export default string
}
