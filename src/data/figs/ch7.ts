import { C, Fig, svg, txt, box, arrow, rect } from './kit';

export const FIGS_CH7: Record<string, Fig> = {
  'fm-downloads': {
    caption: 'Messy Downloads folder (left) sorted into clear folders (right).',
    svg: svg(360, 190,
      rect(10, 14, 140, 160, C.panel, C.rose, 8) + txt(80, 30, 'Downloads (messy)', { fs: 11, fill: C.rose }) +
      txt(80, 58, 'IMG_0021.jpg', { fs: 10, fill: C.mute }) + txt(80, 78, 'final final (2).docx', { fs: 10, fill: C.mute }) +
      txt(80, 98, 'setup.exe', { fs: 10, fill: C.mute }) + txt(80, 118, 'New folder', { fs: 10, fill: C.mute }) +
      txt(80, 138, 'notes (1).pdf', { fs: 10, fill: C.mute }) + txt(80, 158, 'download.zip', { fs: 10, fill: C.mute }) +
      arrow(156, 94, 196, 94, C.blue) +
      rect(204, 14, 146, 160, C.panel, C.green, 8) + txt(277, 30, 'Downloads (tidy)', { fs: 11, fill: C.green }) +
      box(216, 44, 122, 28, 'Study', C.green) + box(216, 80, 122, 28, 'Photos', C.green) + box(216, 116, 122, 28, 'Installers', C.green) +
      txt(277, 160, '2025-11-notes.pdf', { fs: 10, fill: C.mute })),
  },
  'fm-321': {
    caption: 'The 3-2-1 backup rule: 3 copies, 2 different places, 1 away from home.',
    svg: svg(360, 190,
      box(125, 12, 110, 40, 'Your laptop', C.blue, { sub: 'copy 1 (original)' }) +
      arrow(160, 54, 80, 100, C.blue) + arrow(200, 54, 280, 100, C.blue) +
      box(14, 100, 130, 44, 'External disk', C.amber, { sub: 'copy 2 (other device)' }) +
      box(216, 100, 130, 44, 'Cloud storage', C.green, { sub: 'copy 3 (off-site)' }) +
      txt(180, 168, '3 copies  |  2 kinds of storage  |  1 off-site', { fs: 11, fill: C.mute })),
  },
  'fm-copymove': {
    caption: 'Copy leaves the original and makes a second file; Cut and Paste moves the file to the new place.',
    svg: svg(360, 190,
      box(10, 14, 150, 40, 'Folder A', C.blue) + box(200, 14, 150, 40, 'Folder B', C.green) +
      txt(85, 80, 'COPY: file stays in A', { fs: 11, fill: C.amber }) + arrow(160, 34, 198, 34, C.blue) + txt(180, 24, 'copy', { fs: 10, fill: C.blue }) +
      txt(275, 80, 'now in A and B', { fs: 11, fill: C.green }) +
      box(10, 110, 150, 40, 'Folder A', C.blue) + box(200, 110, 150, 40, 'Folder B', C.green) +
      arrow(160, 130, 198, 130, C.amber) + txt(180, 120, 'move', { fs: 10, fill: C.amber }) +
      txt(180, 174, 'CUT + PASTE: file leaves A and arrives in B', { fs: 11, fill: C.mute }))
  },
  'fm-recycle': {
    caption: 'Delete on the computer drive sends a file to the Recycle Bin, where you can restore it. Empty the bin or use a USB drive and it is gone for good.',
    svg: svg(360, 170,
      box(10, 20, 100, 44, 'File', C.blue) + arrow(112, 42, 138, 42, C.mute) +
      box(140, 20, 100, 44, 'Recycle Bin', C.amber, { sub: 'can restore' }) + arrow(242, 42, 268, 42, C.rose) +
      box(270, 20, 80, 44, 'Gone', C.rose, { sub: 'empty bin' }) +
      txt(180, 100, 'Restore: right-click > Restore', { fs: 11, fill: C.green }) +
      txt(180, 130, 'USB drive or Shift+Delete: skips the bin', { fs: 11, fill: C.rose }))
  },
};
