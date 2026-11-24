import { C, Fig, svg, txt, box, arrow, rect, circle } from './kit';

export const FIGS_CH3: Record<string, Fig> = {
  'hw-ramdesk': {
    caption: 'Open = load a file from the cupboard (storage) onto the desk (RAM). Save = put it back. Switch off and the desk is cleared.',
    svg: svg(360, 220,
      rect(10, 20, 100, 90, C.panel2, C.blue) + txt(60, 50, 'RAM', { fs: 13, fill: C.blue, w: 800 }) + txt(60, 72, 'the desk', { fs: 11 }) + txt(60, 94, 'fast, small', { fs: 10, fill: C.mute, w: 500 }) +
      rect(250, 20, 100, 90, C.panel2, C.green) + txt(300, 50, 'STORAGE', { fs: 12, fill: C.green, w: 800 }) + txt(300, 72, 'the cupboard', { fs: 11 }) + txt(300, 94, 'big, keeps files', { fs: 10, fill: C.mute, w: 500 }) +
      arrow(250, 48, 112, 48, C.blue) + arrow(112, 82, 250, 82, C.green) +
      txt(181, 33, 'open (load)', { fs: 10, fill: C.blue }) + txt(181, 98, 'save', { fs: 10, fill: C.green }) +
      box(10, 140, 160, 64, 'Power OFF', C.rose, { sub: 'RAM is emptied' }) + box(190, 140, 160, 64, 'Power OFF', C.green, { sub: 'storage keeps files' })),
  },
  'hw-units': {
    caption: 'Each storage unit is about 1,000 times larger than the one before it.',
    svg: svg(360, 250,
      [['KB', '1,000 bytes', 'a short text note', 50], ['MB', '1,000 KB', 'a photo or a song', 90], ['GB', '1,000 MB', 'hundreds of photos', 130], ['TB', '1,000 GB', 'thousands of films', 170]].map(([n, a, e, w], i) =>
        rect(14, 14 + i * 48, w as number, 40, C.panel2, [C.orange, C.amber, C.green, C.blue][i]) + txt(24, 34 + i * 48, n as string, { fs: 13, anchor: 'start', w: 800 }) +
        txt(24 + (w as number), 28 + i * 48, a as string, { fs: 11, anchor: 'start', w: 700 }) + txt(24 + (w as number), 43 + i * 48, e as string, { fs: 10, anchor: 'start', fill: C.mute, w: 500 })).join('') +
      txt(180, 226, '× 1,000 at every step', { fs: 11, fill: C.amber })),
  },
  'hw-inside': {
    caption: 'Main parts inside a computer: the processor (CPU) works, RAM holds work in progress, storage keeps files, the battery or power supply feeds them all.',
    svg: svg(360, 200,
      rect(10, 10, 340, 180, C.panel, C.line, 10) +
      box(24, 26, 140, 52, 'CPU', C.rose, { sub: 'the brain' }) + box(196, 26, 140, 52, 'RAM', C.blue, { sub: 'working memory' }) +
      box(24, 120, 140, 52, 'Storage', C.green, { sub: 'SSD / HDD' }) + box(196, 120, 140, 52, 'Battery / PSU', C.amber, { sub: 'power' }) +
      arrow(164, 52, 194, 52, C.blue) + arrow(94, 80, 94, 118, C.mute, true) + arrow(266, 118, 266, 80, C.amber, true))
  },
};
