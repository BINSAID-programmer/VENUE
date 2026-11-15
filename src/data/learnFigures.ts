import type { Fig } from './figs/kit';
import { FIGS_CH1 } from './figs/ch1';

export type { Fig };
/** All drawings used by the Computer Basics track, by key. */
export const FIGURES: Record<string, Fig> = { ...FIGS_CH1 };
