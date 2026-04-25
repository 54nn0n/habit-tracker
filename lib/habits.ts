export type HabitKey = 'red_meat' | 'poultry' | 'fish' | 'alcohol';
export type Severity = 0 | 1 | 2 | 3;

export interface Habit {
  key: HabitKey;
  label: string;
  emoji: string;
  color: string;
}

export const HABITS: Habit[] = [
  { key: 'red_meat', label: 'Red Meat', emoji: '🥩', color: '#E8412A' },
  { key: 'poultry', label: 'Poultry', emoji: '🍗', color: '#F5A623' },
  { key: 'fish', label: 'Fish', emoji: '🐟', color: '#2D9CDB' },
  { key: 'alcohol', label: 'Alcohol', emoji: '🍷', color: '#7B3FA0' },
];

export const SEVERITY_CYCLE: Record<Severity, Severity> = {
  0: 1,
  1: 2,
  2: 3,
  3: 0,
};
