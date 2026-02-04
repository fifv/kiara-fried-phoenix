import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import reactSwc from '@vitejs/plugin-react-swc'
import reactOxc from '@vitejs/plugin-react-oxc'
// import react from '@vitejs/plugin-react'
import commonjs from 'vite-plugin-commonjs'
import million from 'million/compiler'
import tailwindcss from '@tailwindcss/vite'

// import glslify from 'vite-plugin-glslify'
// https://vitejs.dev/config/
export default defineConfig({
    experimental: {
        enableNativePlugin: true,
    },
    plugins: [
        // react(),
        react({
            babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] }
        }),
        // reactOxc({}),
        // million.vite({ auto: true }), 
        // reactSwc({
        //     plugins: [
        //         ["@swc-jotai/react-refresh", {}],
        //         ["@swc-jotai/debug-label", {}],
        //     ]
        // }),
        // glslify(),
        commonjs(),
        tailwindcss(),
    ],
    legacy: {
        inconsistentCjsInterop: false,
    },
    // base: './',
    base: './',
    server: {
        host: '0.0.0.0',
        port: 5177,
        fs: {
            // strict: false,
        },
        // hmr: false,
    }
})


