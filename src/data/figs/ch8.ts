import { C, Fig, svg, txt, rect, line, circle } from './kit';

const key = (x: number, y: number, w: number, l: string, c = C.line, f = C.panel) => rect(x, y, w, 28, f, c, 5) + txt(x + w / 2, y + 14, l, { fs: 11 });

export const FIGS_CH8: Record<string, Fig> = {
  'kb-homerow': {
    caption: 'Home row: left fingers on A S D F, right fingers on J K L ;. Thumbs on the space bar. Bumps on F and J.',
    svg: svg(360, 190,
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((l, i) => key(24 + i * 32, 16, 28, l)).join('') +
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'].map((l, i) => key(32 + i * 32, 52, 28, l, [0, 1, 2, 3, 6, 7, 8, 9].includes(i) ? C.green : C.line, [0, 1, 2, 3, 6, 7, 8, 9].includes(i) ? '#14532d' : C.panel)).join('') +
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'].map((l, i) => key(44 + i * 32, 88, 28, l)).join('') +
      rect(104, 126, 150, 28, C.panel, C.blue, 5) + txt(179, 140, 'Space bar (thumbs)', { fs: 11 }) +
      txt(180, 174, 'Feel the small bumps on F and J', { fs: 11, fill: C.amber })),
  },
  'kb-modifier': {
    caption: 'A shortcut = hold a modifier key (Ctrl) and tap a letter.',
    svg: svg(360, 160,
      rect(20, 24, 72, 40, C.panel2, C.amber, 8) + txt(56, 44, 'Ctrl', { fs: 14, fill: C.amber }) + txt(108, 44, '+', { fs: 18 }) +
      rect(124, 24, 52, 40, C.panel2, C.blue, 8) + txt(150, 44, 'C', { fs: 14, fill: C.blue }) + txt(206, 44, '=', { fs: 18 }) + txt(280, 44, 'Copy', { fs: 14, fill: C.green }) +
      txt(180, 92, 'Ctrl+V = Paste   Ctrl+X = Cut   Ctrl+Z = Undo', { fs: 11, fill: C.mute }) +
      txt(180, 116, 'Ctrl+S = Save   Ctrl+A = Select all', { fs: 11, fill: C.mute }) +
      txt(180, 142, 'Hold the first key, tap the second', { fs: 11, fill: C.amber })),
  },
  'kb-posture': {
    caption: 'Good posture: feet flat, back supported, elbows about 90 degrees, wrists straight, eyes level with the top of the screen.',
    svg: svg(360, 210,
      rect(210, 30, 110, 70, C.panel2, C.blue, 6) + txt(265, 65, 'Screen', { fs: 11 }) + line(265, 100, 265, 120, C.line) +
      rect(180, 120, 160, 8, C.panel2, C.line, 3) +
      circle(90, 50, 14, C.panel2, C.amber) + line(90, 64, 90, 128, C.amber, 3) + line(90, 90, 160, 112, C.amber, 3) + line(90, 128, 150, 128, C.amber, 3) + line(150, 128, 150, 190, C.amber, 3) +
      txt(60, 160, 'Back\nsupported', { fs: 10, fill: C.mute }) + txt(250, 160, 'Wrists straight', { fs: 10, fill: C.mute }) + txt(120, 200, 'Feet flat', { fs: 10, fill: C.mute }))
  },
};
