
export interface AudioData {
  buffer: AudioBuffer;
  name: string;
}

export enum VisualizerMode {
  BARS = 'BARS',
  ANALOG = 'ANALOG'
}

export interface ColorPalette {
  violet: string;
  red: string;
  dark: string;
}
