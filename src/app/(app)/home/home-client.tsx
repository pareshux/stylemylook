'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

function greetingForNow() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeClient({ firstName }: { firstName: string }) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [step, setStep] = useState<'event' | 'sub'>('event')

  const events = [
    {
      id: 'casual',
      label: 'Casual Day Out',
      emoji: '☕',
      description: 'Everyday, errands, coffee',
      subcategories: ['Brunch with friends', 'Mall trip', 'Coffee date', 'Errands'],
    },
    {
      id: 'work',
      label: 'Work / Business',
      emoji: '💼',
      description: 'Office, meetings, interviews',
      subcategories: ['Office day', 'Client meeting', 'Job interview', 'Presentation'],
    },
    {
      id: 'date',
      label: 'Date Night',
      emoji: '🌙',
      description: 'Dinner, drinks, special evening',
      subcategories: ['Dinner date', 'Movie night', 'Rooftop drinks', 'First date'],
    },
    {
      id: 'shaadi',
      label: 'Shaadi / Wedding',
      emoji: '💍',
      description: 'Wedding, sangeet, mehendi',
      subcategories: [
        'Wedding ceremony',
        'Sangeet night',
        'Mehendi',
        'Reception',
        'Engagement',
      ],
    },
    {
      id: 'festival',
      label: 'Festival / Tyohar',
      emoji: '🪔',
      description: 'Diwali, Holi, Eid, Navratri',
      subcategories: [
        'Diwali celebration',
        'Holi party',
        'Eid gathering',
        'Navratri garba',
        'Christmas',
      ],
    },
    {
      id: 'party',
      label: 'Party',
      emoji: '🎉',
      description: 'Birthday, houseparty, club',
      subcategories: [
        'Birthday party',
        'House party',
        'Club night',
        'Kitty party',
        'Farewell',
      ],
    },
    {
      id: 'college',
      label: 'College / Campus',
      emoji: '🎓',
      description: 'Class, fest, farewell',
      subcategories: [
        'Regular college day',
        'College fest',
        'Farewell party',
        'Presentation',
        'Exam day',
      ],
    },
    {
      id: 'travel',
      label: 'Travel',
      emoji: '✈️',
      description: 'Airport, vacation, road trip',
      subcategories: [
        'Airport look',
        'Beach vacation',
        'Hill station',
        'Road trip',
        'International travel',
      ],
    },
    {
      id: 'gym',
      label: 'Gym / Active',
      emoji: '🏋️',
      description: 'Gym, yoga, sport, outdoor',
      subcategories: [
        'Gym session',
        'Yoga class',
        'Morning run',
        'Cricket/sport',
        'Outdoor hike',
      ],
    },
    {
      id: 'pooja',
      label: 'Pooja / Temple',
      emoji: '🙏',
      description: 'Temple visit, religious event',
      subcategories: [
        'Temple visit',
        'Family pooja',
        'Religious ceremony',
        'Satyanarayan katha',
      ],
    },
  ] as const

  const selected = selectedEvent
    ? events.find((e) => e.id === selectedEvent) ?? null
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-12">
        <p className="mb-2 text-center text-[18px] font-normal text-[#4E4E4E]">
          {greetingForNow()}, {firstName}! ✨
        </p>
        <h1 className="mb-8 text-center text-[32px] font-bold leading-tight text-[#2A2A2A] md:mb-12 md:text-[48px]">
          What are your plans today?
        </h1>

        <AnimatePresence mode="wait">
          {step === 'event' ? (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {events.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(ev.id)
                        setSelectedSub(null)
                        setStep('sub')
                      }}
                      className={cn(
                        'flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-[#E3DDCF] bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-in-out',
                        'active:border-[#2A2A2A] active:bg-[#2A2A2A] active:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:[&_span]:text-white',
                        'md:min-h-[160px]',
                        'md:hover:scale-[1.02] md:hover:border-[#2A2A2A] md:hover:bg-[#E3DDCF] md:hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
                        'cursor-pointer'
                      )}
                    >
                      <span
                        className="text-[32px] leading-none text-[#2A2A2A] md:text-[40px]"
                        aria-hidden
                      >
                        {ev.emoji}
                      </span>
                      <span className="text-[14px] font-medium leading-tight text-[#2A2A2A] md:text-[16px]">
                        {ev.label}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sub"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep('event')}
                  className="inline-flex rounded-full border border-[#2A2A2A] bg-white px-4 py-2 text-sm font-medium text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF]"
                >
                  ← Back
                </button>
                <div className="flex-1" />
              </div>

              <p className="mb-3 text-center text-[12px] font-medium text-[#8A8680]">
                Getting more specific...
              </p>

              {selected ? (
                <>
                  <div className="mb-6 flex items-center justify-center">
                    <div className="inline-flex items-center gap-3 rounded-full border border-[#E3DDCF] bg-white px-5 py-3">
                      <span className="text-[26px]" aria-hidden>
                        {selected.emoji}
                      </span>
                      <span className="text-sm font-semibold text-[#2A2A2A]">
                        {selected.label}
                      </span>
                    </div>
                  </div>

                  <h2 className="mb-4 text-center text-[24px] font-bold text-[#2A2A2A]">
                    What's the occasion?
                  </h2>

                  <div className="flex flex-wrap justify-center gap-3">
                    {selected.subcategories.map((sub) => {
                      const isSelected = selectedSub === sub
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setSelectedSub(sub)
                            router.push(
                              `/suggestions?event=${encodeURIComponent(
                                selected.id
                              )}&sub=${encodeURIComponent(sub)}`
                            )
                          }}
                          className={cn(
                            'rounded-2xl px-5 py-3 text-sm font-medium transition-colors',
                            'border border-[#E3DDCF] bg-white text-[#2A2A2A] hover:border-[#2A2A2A] hover:bg-[#F5F3EC]',
                            isSelected &&
                              'bg-[#2A2A2A] text-white border-[#2A2A2A] hover:border-[#2A2A2A] hover:bg-[#2A2A2A]'
                          )}
                        >
                          {sub}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedEvent) return
                        router.push(
                          `/suggestions?event=${encodeURIComponent(selectedEvent)}`
                        )
                      }}
                      className="text-sm text-[#8A8680] underline"
                    >
                      Skip — just use general {selected.label}
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
