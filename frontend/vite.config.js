import { defineConfig } from 'vite'

export default defineConfig({
  // 关键配置：把打包结果直接输出到后端的 static 目录
  build: {
    outDir: '../backend/static',
    emptyOutDir: true, // 每次打包前清空旧文件，防止缓存
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000' // 开发环境代理
    }
  }
})