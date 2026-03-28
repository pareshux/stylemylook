'use client'

import { useRouter } from 'next/navigation'

import { WardrobeUploadForm } from '@/components/app/wardrobe-upload-form'

export default function WardrobeUploadPage() {
  const router = useRouter()

  return (
    <WardrobeUploadForm
      heading="Add to wardrobe 👗"
      subtext="Upload photos — same as your first setup. Add as many as you like."
      completeLabel="Done"
      floatingComplete={false}
      onComplete={() => router.push('/wardrobe')}
    />
  )
}
