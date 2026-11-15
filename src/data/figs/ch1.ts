import { C, Fig, svg, txt, box, arrow, line, rect, circle, mover, badge } from './kit';

export const FIGS_CH1: Record<string, Fig> = {
  cycle: {
    caption: 'The information-processing cycle. Watch the dot: data goes in, is processed, comes out, and can be stored.',
    svg: svg(360, 220,
      box(14, 40, 88, 56, 'INPUT', C.green) + box(136, 40, 88, 56, 'PROCESSING', C.amber, { fs: 10, sub: 'CPU + software' }) + box(258, 40, 88, 56, 'OUTPUT', C.blue) + box(136, 150, 88, 50, 'STORAGE', C.vio) +
      arrow(102, 68, 136, 68, C.green) + arrow(224, 68, 258, 68, C.blue) + arrow(172, 96, 172, 150, C.vio) + arrow(190, 150, 190, 96, C.vio) +
      txt(58, 118, 'keyboard\nmouse\nmicrophone', { fs: 9, fill: C.mute, w: 500 }) + txt(302, 118, 'screen\nprinter\nspeakers', { fs: 9, fill: C.mute, w: 500 }) +
      txt(272, 175, 'SSD / HDD / flash', { fs: 9, fill: C.mute, w: 500 }) +
      mover('M20,24 L340,24', 5, C.amber, 5)),
  },
  datainfo: {
    caption: 'Data are raw facts. When a computer processes them, they become information that helps you decide.',
    svg: svg(360, 150,
      box(10, 35, 100, 70, 'DATA', C.rose, { sub: '45  60  75  80' }) + arrow(110, 70, 140, 70, C.mute) +
      box(140, 35, 80, 70, 'PROCESS', C.amber, { sub: 'add, divide' }) + arrow(220, 70, 250, 70, C.mute) +
      box(250, 35, 100, 70, 'INFORMATION', C.green, { fs: 10, sub: 'Average = 65' }) +
      txt(180, 130, 'raw facts  →  processed  →  useful meaning', { fs: 10, fill: C.mute, w: 500 })),
  },
  types: {
    caption: 'Five common kinds of computer. They all follow the same input → process → output → storage cycle.',
    svg: svg(360, 150,
      // desktop
      rect(14, 30, 52, 36, C.panel2, C.blue) + rect(34, 66, 12, 8, C.panel, C.line, 2) + rect(24, 74, 32, 5, C.panel, C.line, 2) +
      // laptop
      rect(92, 34, 50, 34, C.panel2, C.green) + rect(84, 70, 66, 7, C.panel, C.green, 3) +
      // tablet
      rect(172, 28, 36, 50, C.panel2, C.amber, 5) + circle(190, 72, 2.5, C.amber, C.amber) +
      // phone
      rect(240, 30, 24, 48, C.panel2, C.vio, 5) + circle(252, 72, 2, C.vio, C.vio) +
      // server
      rect(294, 24, 46, 16, C.panel2, C.rose) + rect(294, 44, 46, 16, C.panel2, C.rose) + rect(294, 64, 46, 16, C.panel2, C.rose) +
      circle(302, 32, 2, C.rose, C.rose) + circle(302, 52, 2, C.rose, C.rose) + circle(302, 72, 2, C.rose, C.rose) +
      txt(40, 100, 'Desktop', { fs: 10 }) + txt(116, 100, 'Laptop', { fs: 10 }) + txt(190, 100, 'Tablet', { fs: 10 }) + txt(252, 100, 'Smartphone', { fs: 10 }) + txt(317, 100, 'Server', { fs: 10 }) +
      txt(40, 118, 'fixed', { fs: 9, fill: C.mute, w: 500 }) + txt(116, 118, 'portable', { fs: 9, fill: C.mute, w: 500 }) + txt(190, 118, 'touchscreen', { fs: 9, fill: C.mute, w: 500 }) + txt(252, 118, 'in your hand', { fs: 9, fill: C.mute, w: 500 }) + txt(317, 118, 'serves others', { fs: 9, fill: C.mute, w: 500 })),
  },
  setup: {
    caption: 'A desktop setup. Green parts send data IN, blue parts show results OUT, and the amber case does the processing and storing.',
    svg: svg(360, 230,
      rect(100, 18, 140, 92, C.panel2, C.blue) + rect(106, 24, 128, 74, '#0b1220', C.blue, 3) + rect(158, 110, 24, 14, C.panel, C.line, 2) + rect(138, 124, 64, 7, C.panel, C.line, 3) +
      txt(170, 60, 'MONITOR', { fs: 11, fill: C.blue }) + txt(170, 78, 'output', { fs: 9, fill: C.mute, w: 500 }) +
      rect(20, 170, 130, 36, C.panel2, C.green) + txt(85, 188, 'KEYBOARD  (input)', { fs: 10, fill: C.green }) +
      rect(170, 172, 28, 34, C.panel2, C.green, 12) + txt(184, 220, 'mouse', { fs: 9, fill: C.green }) +
      rect(256, 70, 78, 130, C.panel2, C.amber) + txt(295, 120, 'SYSTEM\nUNIT', { fs: 10, fill: C.amber }) + txt(295, 160, 'CPU · RAM\nstorage', { fs: 9, fill: C.mute, w: 500 }) +
      rect(8, 36, 40, 60, C.panel2, C.blue) + txt(28, 66, 'speaker', { fs: 8, fill: C.blue }) + rect(300, 20, 50, 32, C.panel2, C.blue) + txt(325, 36, 'printer', { fs: 9, fill: C.blue }) +
      line(240, 80, 256, 100, C.line) + line(85, 206, 85, 218, C.line) + line(85, 218, 295, 218, C.line) + line(295, 218, 295, 200, C.line) + line(198, 189, 256, 189, C.line)),
  },
  devices: {
    caption: 'Input devices send data into the computer; output devices bring results out of it.',
    svg: svg(360, 250,
      box(130, 85, 100, 70, 'COMPUTER', C.amber) +
      txt(65, 14, 'INPUT', { fs: 11, fill: C.green }) + txt(295, 14, 'OUTPUT', { fs: 11, fill: C.blue }) +
      ['Keyboard', 'Mouse', 'Touchpad', 'Microphone', 'Webcam', 'Scanner'].map((d, i) => rect(8, 26 + i * 36, 112, 28, C.panel, C.green) + txt(64, 40 + i * 36, d, { fs: 10 })).join('') +
      ['Monitor', 'Printer', 'Speakers', 'Headphones', 'Projector'].map((d, i) => rect(240, 26 + i * 42, 112, 30, C.panel, C.blue) + txt(296, 41 + i * 42, d, { fs: 10 })).join('') +
      arrow(122, 120, 130, 120, C.green) + arrow(230, 120, 238, 120, C.blue)),
  },
  inside: {
    caption: 'A simplified motherboard. The CPU works, RAM holds the active tasks, and the storage drive keeps your files.',
    svg: svg(360, 250,
      rect(10, 10, 340, 230, '#10331f', C.green, 10) +
      rect(30, 30, 80, 50, C.panel2, C.orange) + txt(70, 55, 'POWER\nconnector', { fs: 9, fill: C.orange }) +
      rect(140, 40, 70, 70, C.panel2, C.amber) + rect(152, 52, 46, 46, C.amber, C.amber, 3) + txt(175, 75, 'CPU', { fs: 12, fill: '#0f172a', w: 800 }) +
      rect(250, 24, 18, 110, C.panel2, C.blue, 3) + rect(274, 24, 18, 110, C.panel2, C.blue, 3) + rect(298, 24, 18, 110, C.panel2, C.blue, 3) + txt(284, 148, 'RAM slots', { fs: 10, fill: C.blue }) +
      rect(30, 150, 110, 70, C.panel2, C.vio) + txt(85, 185, 'GPU\n(graphics)', { fs: 10, fill: C.vio }) +
      rect(170, 170, 160, 50, C.panel2, C.green) + txt(250, 195, 'STORAGE  SSD / HDD', { fs: 10, fill: C.green }) +
      line(175, 110, 175, 170, C.mute, 2) + line(210, 75, 250, 75, C.mute, 2) + line(110, 55, 140, 60, C.mute, 2) + line(85, 150, 150, 110, C.mute, 2) +
      txt(180, 124, 'bus', { fs: 8, fill: C.mute, anchor: 'start', w: 500 })),
  },
  deskcup: {
    caption: 'RAM is your desk (fast, small, cleared when you leave). Storage is the cupboard (slower, big, keeps things). The CPU is you, doing the work.',
    svg: svg(360, 200,
      circle(60, 70, 22, C.panel2, C.amber) + txt(60, 70, 'CPU', { fs: 11, fill: C.amber }) + txt(60, 106, 'the worker', { fs: 9, fill: C.mute, w: 500 }) +
      rect(120, 60, 100, 40, C.panel2, C.blue) + txt(170, 80, 'RAM · desk', { fs: 11, fill: C.blue }) + txt(170, 116, 'small, very fast,\nforgets at power-off', { fs: 9, fill: C.mute, w: 500 }) +
      rect(255, 30, 92, 110, C.panel2, C.green) + txt(301, 70, 'STORAGE', { fs: 10, fill: C.green }) + txt(301, 88, 'cupboard', { fs: 10, fill: C.green }) + txt(301, 156, 'big, slower,\nkeeps files', { fs: 9, fill: C.mute, w: 500 }) +
      arrow(84, 76, 120, 76, C.amber) + arrow(120, 86, 84, 86, C.amber) + arrow(220, 80, 255, 80, C.mute) + arrow(255, 94, 220, 94, C.mute) +
      txt(237, 66, 'open', { fs: 8, fill: C.mute, w: 500 }) + txt(237, 106, 'save', { fs: 8, fill: C.mute, w: 500 })),
  },
  fde: {
    caption: 'The CPU repeats three steps billions of times each second: fetch an instruction, decode it, execute it.',
    svg: svg(360, 200,
      circle(180, 108, 45, 'none', C.line) + txt(180, 108, 'CPU', { fs: 14, fill: C.amber, w: 800 }) +
      box(100, 4, 160, 44, '1 FETCH', C.green, { fs: 11, sub: 'get the next instruction from RAM' }) + box(226, 146, 128, 46, '2 DECODE', C.blue, { fs: 11, sub: 'work out what it means' }) + box(6, 146, 128, 46, '3 EXECUTE', C.rose, { fs: 11, sub: 'do it: add, compare, move' }) +
      mover('M180,63 A45,45 0 0 1 225,108 A45,45 0 0 1 180,153 A45,45 0 0 1 135,108 A45,45 0 0 1 180,63', 4, C.amber, 5)),
  },
  hier: {
    caption: 'The memory pyramid: the closer to the CPU, the faster, smaller and more expensive.',
    svg: svg(360, 230,
      [['Registers', 70, C.rose], ['Cache', 110, C.orange], ['RAM', 160, C.amber], ['SSD', 210, C.green], ['HDD', 260, C.blue]].map(([n, w, col], i) =>
        rect(180 - (w as number) / 2, 14 + i * 40, w as number, 34, C.panel2, col as string) + txt(180, 31 + i * 40, n as string, { fs: 11, fill: col as string })).join('') +
      arrow(338, 190, 338, 20, C.mute) + txt(338, 205, 'faster', { fs: 9, fill: C.mute, w: 500 }) +
      arrow(22, 20, 22, 190, C.mute) + txt(22, 205, 'bigger', { fs: 9, fill: C.mute, w: 500 })),
  },
  layers: {
    caption: 'You never talk to the hardware directly. Applications ask the operating system, and the operating system controls the hardware.',
    svg: svg(360, 256,
      box(60, 8, 240, 42, 'YOU  (the user)', C.rose) + box(60, 72, 240, 46, 'APPLICATIONS', C.green, { sub: 'Word · Chrome · media player' }) +
      box(60, 140, 240, 46, 'OPERATING SYSTEM', C.vio, { sub: 'Windows · Android · Linux · macOS' }) + box(60, 208, 240, 46, 'HARDWARE', C.amber, { sub: 'CPU · RAM · storage · screen' }) +
      arrow(180, 50, 180, 72, C.mute) + arrow(180, 118, 180, 140, C.mute) + arrow(180, 186, 180, 208, C.mute)),
  },
  typing: {
    caption: 'Typing and saving a paragraph: amber = hardware, violet = software.',
    svg: svg(360, 210,
      box(8, 20, 80, 44, 'Keyboard', C.amber, { sub: 'hardware' }) + box(110, 20, 112, 44, 'OS + Word', C.vio, { sub: 'software' }) + box(250, 20, 100, 44, 'Screen', C.amber, { sub: 'hardware' }) +
      box(110, 130, 112, 44, 'Storage drive', C.amber, { sub: 'hardware · Save' }) +
      arrow(88, 42, 110, 42, C.mute) + arrow(222, 42, 250, 42, C.mute) + arrow(166, 64, 166, 130, C.mute) +
      txt(48, 84, '1 you type', { fs: 9, fill: C.mute, w: 500 }) + txt(236, 84, '2 letters appear', { fs: 9, fill: C.mute, w: 500 }) + txt(250, 100, '3 you press Ctrl+S', { fs: 9, fill: C.mute, w: 500 })),
  },
  bits: {
    caption: 'One byte is 8 bits. Each bit is worth double the one on its right. The byte 00001101 is 8 + 4 + 1 = 13.',
    svg: svg(360, 170,
      [128, 64, 32, 16, 8, 4, 2, 1].map((v, i) => {
        const on = [0, 0, 0, 0, 1, 1, 0, 1][i];
        return rect(14 + i * 42, 40, 38, 44, on ? C.green : C.panel2, on ? C.green : C.line, 6) + txt(33 + i * 42, 62, String(on), { fs: 18, fill: on ? '#0f172a' : C.mute, w: 800 }) + txt(33 + i * 42, 28, String(v), { fs: 10, fill: C.mute, w: 500 });
      }).join('') +
      line(14, 100, 346, 100, C.line) + txt(180, 116, '1 byte = 8 bits', { fs: 10, fill: C.mute, w: 500 }) + txt(180, 146, '8 + 4 + 1  =  13', { fs: 15, fill: C.amber, w: 800 })),
  },
  units: {
    caption: 'Storage sizes. Each step is about 1,000 times bigger (computers count 1,024).',
    svg: svg(360, 250,
      [['bit', '0 or 1', 40], ['byte (8 bits)', 'one letter, like A', 70], ['KB', 'a short text note', 100], ['MB', 'a photo or a song', 130], ['GB', 'a movie or a big app', 160], ['TB', 'thousands of photos', 190]].map(([n, e, w], i) =>
        rect(14, 12 + i * 38, w as number, 30, C.panel2, [C.mute, C.rose, C.orange, C.amber, C.green, C.blue][i]) + txt(22, 27 + i * 38, n as string, { fs: 10, anchor: 'start', fill: C.text }) + txt(24 + (w as number), 27 + i * 38, e as string, { fs: 9, fill: C.mute, anchor: 'start', w: 500 })).join('')),
  },
  boot: {
    caption: 'What happens between pressing the power button and seeing the desktop.',
    svg: svg(360, 270,
      [['Power on', 'electricity reaches the motherboard'], ['Self-test', 'firmware checks CPU, RAM and drives'], ['Find the OS', 'the boot loader looks on the storage drive'], ['Load Windows', 'system files are copied into RAM'], ['Sign in', 'you see the desktop and can start work']].map(([a, b], i) =>
        rect(12, 8 + i * 52, 336, 44, C.panel, [C.orange, C.amber, C.green, C.blue, C.vio][i]) + badge(36, 30 + i * 52, i + 1, [C.orange, C.amber, C.green, C.blue, C.vio][i]) + txt(58, 22 + i * 52, a, { fs: 11, anchor: 'start', w: 700 }) + txt(58, 38 + i * 52, b, { fs: 9, anchor: 'start', fill: C.mute, w: 500 })).join('')),
  },
};
