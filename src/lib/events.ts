export type EventChip = { id: string; emoji: string; label: string }

export const EVENT_CHIPS: EventChip[] = [
  { id: 'casual', emoji: '☕', label: 'Casual Day Out' },
  { id: 'work', emoji: '💼', label: 'Work / Business' },
  { id: 'date', emoji: '🌙', label: 'Date Night' },
  { id: 'shaadi', emoji: '💍', label: 'Shaadi / Wedding' },
  { id: 'festival', emoji: '🪔', label: 'Festival / Tyohar' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'college', emoji: '🎓', label: 'College / Campus' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'gym', emoji: '🏋️', label: 'Gym / Active' },
  { id: 'pooja', emoji: '🙏', label: 'Pooja / Temple' },
]

export function eventLabel(id: string) {
  return EVENT_CHIPS.find((e) => e.id === id)?.label ?? id
}
