
import { ColorPalette } from './types';

export interface ExtendedColorPalette extends ColorPalette {
  blue: string;
  green: string;
}

export const COLORS: ExtendedColorPalette = {
  violet: '#b026ff',
  red: '#ff003c',
  dark: '#050505',
  blue: '#00b8ff',
  green: '#00ff9f',
};

export const FFT_SIZE = 256;
