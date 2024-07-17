import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // 打包后的文件输出目录
        emptyOutDir: true,
        lib: {
            entry: './src/index.ts',
            fileName: 'index',
            name: '_transform',
            formats: ['umd', 'es','cjs']
        }
    }
});
