export interface Word {
  id: number;
  text: string;
  meaning: string;
  selected: boolean;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  isFlipped: boolean;
}
