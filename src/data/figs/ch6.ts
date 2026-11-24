import { C, Fig, svg, txt, rect, line, box, arrow } from './kit';

export const FIGS_CH6: Record<string, Fig> = {
  'fl-tree': {
    caption: 'A folder tree. Folders hold subfolders and files, so every file has one clear home.',
    svg: svg(360, 250,
      rect(10, 8, 120, 28, C.panel2, C.amber) + txt(70, 22, 'Documents', { fs: 11, fill: C.amber, w: 700 }) +
      line(24, 36, 24, 200, C.line) +
      line(24, 60, 44, 60) + rect(44, 46, 130, 28, C.panel2, C.blue) + txt(109, 60, 'School', { fs: 11, fill: C.blue, w: 700 }) +
      line(24, 150, 44, 150) + rect(44, 136, 130, 28, C.panel2, C.blue) + txt(109, 150, 'Personal', { fs: 11, fill: C.blue, w: 700 }) +
      line(24, 200, 44, 200) + rect(44, 186, 130, 28, C.panel2, C.blue) + txt(109, 200, 'Bills', { fs: 11, fill: C.blue, w: 700 }) +
      line(109, 74, 109, 108) + line(109, 94, 190, 94) + line(109, 124, 190, 124) + line(109, 108, 109, 124) +
      rect(190, 80, 150, 28, C.panel2, C.green) + txt(265, 94, 'Mathematics', { fs: 11, fill: C.green, w: 700 }) +
      rect(190, 110, 150, 28, C.panel2, C.green) + txt(265, 124, 'Computer_Basics', { fs: 11, fill: C.green, w: 700 }) +
      line(265, 138, 265, 156) + rect(190, 156, 150, 26, C.bg, C.mute, 4) + txt(265, 169, 'notes_week1.docx', { fs: 10, fill: C.mute, w: 500 }) +
      txt(300, 28, 'folder  >  subfolder  >  file', { fs: 10, fill: C.mute, w: 500 }).replace('x="300"', 'x="300"') ),
  },
  'fl-path': {
    caption: 'Read a path from left to right: each part is a folder inside the previous one, and the last part is the file.',
    svg: svg(360, 250,
      [['C:', 'main drive', C.rose], ['Users', 'all accounts', C.orange], ['Neema', 'your own folder', C.amber], ['Documents', 'folder', C.green], ['Digital_Foundations', 'folder you made', C.cyan], ['My_Learning_Goals.docx', 'the file', C.vio]].map(([n, e, col], i) =>
        rect(10 + i * 14, 8 + i * 38, 230 - i * 6 + (i === 5 ? 20 : 0), 32, C.panel2, col as string) + txt(18 + i * 14, 24 + i * 38, n as string, { fs: 11, anchor: 'start', fill: col as string, w: 700 }) +
        '').join('') +
      txt(180, 240, '', {})),
  },
  'fl-filename': {
    caption: 'A file name has two parts: the name you choose and the extension that tells Windows the file type.',
    svg: svg(360, 150,
      rect(30, 30, 180, 44, C.panel2, C.blue, 8) + txt(120, 52, 'Biology notes', { fs: 14, fill: C.blue }) +
      rect(210, 30, 70, 44, C.panel2, C.amber, 8) + txt(245, 52, '.docx', { fs: 14, fill: C.amber }) +
      txt(120, 96, 'name (you choose)', { fs: 11, fill: C.mute }) + txt(245, 96, 'extension', { fs: 11, fill: C.mute }) +
      txt(180, 128, '.docx Word   .pdf PDF   .jpg picture   .mp3 audio   .xlsx Excel', { fs: 10, fill: C.mute }))
  },
};
