'use client'

import { useRouter } from 'next/navigation'

import { WardrobeUploadForm } from '@/components/app/wardrobe-upload-form'

export function OnboardingClient() {
  const router = useRouter()

  return (
    <WardrobeUploadForm
      heading="Add your wardrobe 👗"
      subtext="Upload photos of your clothes — tops, bottoms, dresses, shoes, accessories, everything"
      completeLabel="Done, let's style →"
      floatingComplete
      onComplete={() => router.push('/home')}
    />
  )
}
