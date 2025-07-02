// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // mode === 'development' | 'production'
  const isProd = mode === 'production'

  return {
    plugins: [vue()],

    /* 仅 build 时才加 /superwords/ 前缀 */
    base: isProd ? '/superwords/' : '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    // 开发服务器配置
    server: {
      proxy: {
        '/api': {
          target: 'https://readapi.bluebirdabc.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    }
  }
})
