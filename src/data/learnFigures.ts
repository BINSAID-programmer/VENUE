import type { Fig } from './figs/kit';
import { FIGS_CH1 } from './figs/ch1';
import { FIGS_CH3 } from './figs/ch3';
import { FIGS_CH5 } from './figs/ch5';
import { FIGS_CH6 } from './figs/ch6';
import { FIGS_CH7 } from './figs/ch7';
import { FIGS_CH8 } from './figs/ch8';

export type { Fig };
/** All drawings used by the Computer Basics track, by key. */
export const FIGURES: Record<string, Fig> = { ...FIGS_CH1, ...FIGS_CH3, ...FIGS_CH5, ...FIGS_CH6, ...FIGS_CH7, ...FIGS_CH8 };
