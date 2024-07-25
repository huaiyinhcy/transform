import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [dts({ include: ['src'] })],
    build: {
        // 打包后的文件输出目录
        emptyOutDir: true,
        lib: {
            entry: 'src/index.ts',
            fileName: 'index',
            name: '_transform',
            formats: ['umd', 'es', 'cjs']
        }
    }
});
