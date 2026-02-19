import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [angular()],
  build: {
    outDir: 'dist'
  }
});