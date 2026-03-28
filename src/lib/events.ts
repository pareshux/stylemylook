export type EventChip = { id: string; emoji: string; label: string }

export const EVENT_CHIPS: EventChip[] = [
  { id: 'lunch-date', emoji: '🍽', label: 'Lunch date' },
  { id: 'dinner-date', emoji: '🌙', label: 'Dinner date' },
  { id: 'work-meeting', emoji: '💼', label: 'Work meeting' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'casual-hangout', emoji: '☕', label: 'Casual hangout' },
  { id: 'festival', emoji: '🎪', label: 'Festival' },
  { id: 'gym', emoji: '🏋️', label: 'Gym' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'wedding', emoji: '💍', label: 'Wedding' },
  { id: 'college', emoji: '🎓', label: 'College' },
]

export function eventLabel(id: string) {
  return EVENT_CHIPS.find((e) => e.id === id)?.label ?? id
}
