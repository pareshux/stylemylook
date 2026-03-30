'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'

interface InAppCameraProps {
  onCapture: (files: File[]) => void
  onClose: () => void
}

export function InAppCamera({ onCapture, onClose }: InAppCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<
    { dataUrl: string; file: File }[]
  >([])
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    'environment'
  )
  const [flash, setFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = useCallback(async () => {
    setCameraReady(false)
    setCameraError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera permission.')
    }
  }, [facingMode])

  useEffect(() => {
    void startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [startCamera])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return
    setIsCapturing(true)

    setFlash(true)
    setTimeout(() => setFlash(false), 120)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      return
    }

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsCapturing(false)
          return
        }
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })

        setCapturedPhotos((prev) => [...prev, { dataUrl, file }])
        setIsCapturing(false)
      },
      'image/jpeg',
      0.92
    )
  }, [isCapturing])

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDone = () => {
    const files = capturedPhotos.map((p) => p.file)
    onCapture(files)
    onClose()
  }

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      style={{ touchAction: 'none' }}
    >
      {flash ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          style={{ opacity: 0.85, transition: 'opacity 0.12s' }}
        />
      ) : null}

      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraReady && !cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : null}

        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-8">
            <div className="text-center">
              <p className="mb-6 text-base text-white">{cameraError}</p>
              <button
                onClick={onClose}
                className="rounded-full bg-white px-8 py-3 font-medium text-black"
              >
                Go back
              </button>
            </div>
          </div>
        ) : null}

        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {capturedPhotos.length > 0 ? (
            <div className="rounded-full bg-black/50 px-4 py-1.5 backdrop-blur">
              <span className="text-sm font-semibold text-white">
                {capturedPhotos.length} photo
                {capturedPhotos.length !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={flipCamera}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur"
          >
            <RotateCcw className="h-5 w-5 text-white" />
          </button>
        </div>

        {capturedPhotos.length === 0 && cameraReady ? (
          <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="rounded-full bg-black/40 px-4 py-2 backdrop-blur">
              <p className="text-sm text-white/80">Tap the button to take a photo</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-shrink-0 bg-black px-6 pb-8 pt-4">
        {capturedPhotos.length > 0 ? (
          <div className="mb-4">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {capturedPhotos.map((photo, i) => (
                <div key={i} className="group relative flex-shrink-0">
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${i + 1}`}
                    className="h-16 w-16 rounded-xl border-2 border-white/20 object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-lg"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1">
                    <span className="text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <label className="flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white/10">
            {capturedPhotos.length > 0 ? (
              <img
                src={capturedPhotos[capturedPhotos.length - 1].dataUrl}
                className="h-full w-full object-cover"
                alt="last photo"
              />
            ) : (
              <span className="px-1 text-center text-[10px] leading-tight text-white/50">
                Gallery
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                const newPhotos = files.map((file) => ({
                  dataUrl: URL.createObjectURL(file),
                  file,
                }))
                setCapturedPhotos((prev) => [...prev, ...newPhotos])
                e.target.value = ''
              }}
            />
          </label>

          <button
            onClick={capturePhoto}
            disabled={!cameraReady || isCapturing}
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-50"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="h-[62px] w-[62px] rounded-full bg-white" />
          </button>

          {capturedPhotos.length > 0 ? (
            <button
              onClick={handleDone}
              className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95"
            >
              <Check className="h-7 w-7 stroke-[2.5] text-black" />
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <span className="text-[10px] font-bold text-white">
                  {capturedPhotos.length}
                </span>
              </div>
            </button>
          ) : (
            <div className="h-14 w-14 flex-shrink-0" />
          )}
        </div>

        <p className="mt-3 text-center text-xs text-white/40">
          {capturedPhotos.length === 0
            ? 'Take as many photos as you need'
            : `Tap ✓ to add ${capturedPhotos.length} photo${capturedPhotos.length !== 1 ? 's' : ''} to your wardrobe`}
        </p>
      </div>
    </div>
  )
}
