import { C, Fig, svg, txt, rect, badge } from './kit';

export const FIGS_CH5: Record<string, Fig> = {
  'dt-desktop': {
    caption: 'The Windows desktop: 1 background, 2 icons, 3 Start button, 4 search, 5 taskbar apps, 6 notification area.',
    svg: svg(360, 256,
      rect(8, 8, 344, 184, '#17315a', C.blue, 8) +
      rect(22, 20, 36, 30, C.panel2, C.amber, 4) + txt(40, 60, 'Folder', { fs: 10 }) +
      rect(22, 78, 36, 30, C.panel2, C.green, 4) + txt(40, 118, 'Shortcut', { fs: 10 }) +
      rect(22, 136, 36, 30, C.panel2, C.mute, 4) + txt(40, 176, 'Recycle Bin', { fs: 10 }) +
      txt(215, 100, 'Desktop background', { fs: 11, fill: C.text, w: 500 }) +
      rect(8, 200, 344, 48, '#0b1220', C.line, 6) +
      rect(18, 220, 24, 22, C.blue, C.blue, 4) + rect(50, 220, 92, 22, C.panel2, C.line, 11) + txt(96, 231, 'Search', { fs: 10, fill: C.mute }) +
      rect(156, 220, 22, 22, C.panel2, C.amber, 4) + rect(184, 220, 22, 22, C.panel2, C.green, 4) + rect(212, 220, 22, 22, C.panel2, C.rose, 4) +
      txt(298, 231, 'Wi-Fi  Vol  10:30', { fs: 10 }) +
      badge(74, 35, 2, C.amber) + badge(215, 70, 1, C.amber) + badge(30, 208, 3, C.amber) + badge(96, 208, 4, C.amber) + badge(195, 208, 5, C.amber) + badge(298, 208, 6, C.amber)),
  },
};
