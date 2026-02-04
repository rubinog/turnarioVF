import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  theme: {
    colors: {
      vvf: '#a90708',
      vvfHover: '#c4090a',
    }
  }
})
