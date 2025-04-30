"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Download, ArrowLeft, Scissors, Play, Pause, RefreshCw, AlertCircle } from "lucide-react"
import GifEncoder from "@/components/gif-encoder"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateGIF() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5) // Default 5 seconds
  const [fps, setFps] = useState(10)
  const [quality, setQuality] = useState(10)
  const [width, setWidth] = useState(320) // Reduced default width for better performance
  const [conversionProgress, setConversionProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      setGifUrl(null)
      setStartTime(0)
      setError(null)

      // Reset progress
      setConversionProgress(0)
    }
  }

  // Update video duration when video is loaded
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration)
      setEndTime(Math.min(5, videoElement.duration)) // Set end time to 5 seconds or video duration if shorter
    }

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [videoUrl])

  // Update current time during playback
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)

      // Loop playback within the selected range
      if (videoElement.currentTime >= endTime) {
        videoElement.currentTime = startTime
      }
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [startTime, endTime])

  // Play/Pause video
  const togglePlayPause = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPlaying) {
      videoElement.pause()
    } else {
      videoElement.currentTime = startTime
      videoElement.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Update time range
  const handleTimeRangeChange = (values: number[]) => {
    const [start, end] = values
    setStartTime(start)
    setEndTime(end)

    // Update video current time to start time
    if (videoRef.current) {
      videoRef.current.currentTime = start
    }
  }

  // Convert video to GIF
  const convertToGif = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !videoUrl) return

    setIsConverting(true)
    setConversionProgress(0)
    setError(null)

    try {
      // Set up canvas
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Calculate height maintaining aspect ratio
      const aspectRatio = video.videoHeight / video.videoWidth
      const height = Math.round(width * aspectRatio)

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Initialize GIF encoder
      const gifEncoder = new GifEncoder({
        width,
        height,
        quality,
        fps,
        onProgress: (progress) => {
          setConversionProgress(Math.round(progress * 100))
        },
      })

      // Start encoding
      await gifEncoder.start()

      // Calculate total frames
      const duration = endTime - startTime
      const totalFrames = Math.floor(duration * fps)

      // Limit frames for performance
      const maxFrames = 100 // Reasonable limit for browser-based encoding
      const actualFrames = Math.min(totalFrames, maxFrames)

      if (totalFrames > maxFrames) {
        // Adjust FPS to maintain duration with fewer frames
        const adjustedFps = maxFrames / duration
        console.log(`Limiting frames to ${maxFrames} (adjusted FPS: ${adjustedFps.toFixed(2)})`)
      }

      // Set expected frames for progress calculation
      gifEncoder.setExpectedFrames?.(actualFrames)

      // Capture frames
      for (let i = 0; i < actualFrames; i++) {
        // Set video to correct time
        const frameTime = startTime + (i / actualFrames) * duration
        video.currentTime = frameTime

        // Wait for video to update to the correct frame
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked)
            resolve()
          }
          video.addEventListener("seeked", onSeeked)
        })

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, width, height)

        // Add frame to GIF
        const imageData = ctx.getImageData(0, 0, width, height)
        await gifEncoder.addFrame(imageData)

        // Update progress based on frames processed
        setConversionProgress(Math.round((i / actualFrames) * 50)) // First 50% is frame capture
      }

      // Finish encoding
      const blob = await gifEncoder.finish()
      const url = URL.createObjectURL(blob)
      setGifUrl(url)
    } catch (error) {
      console.error("Error converting to GIF:", error)
      setError("Failed to convert video to GIF. Please try a shorter clip or lower quality settings.")
    } finally {
      setIsConverting(false)
    }
  }

  // Download GIF
  const downloadGif = () => {
    if (!gifUrl) return

    const a = document.createElement("a")
    a.href = gifUrl
    a.download = `${videoFile?.name.split(".")[0] || "giflab"}.gif`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                GIFLab
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Your GIF</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!videoUrl ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-900/20 dark:bg-purple-900/5">
              <Film className="h-12 w-12 text-purple-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">Upload a video to get started</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Drag and drop a video file or click to browse. We support MP4, WebM, and MOV formats.
              </p>
              <Label
                htmlFor="video-upload"
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-md"
              >
                Choose Video
              </Label>
              <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative rounded-lg overflow-hidden border bg-black aspect-video">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trim Video</span>
                      <span>
                        {formatTime(startTime)} - {formatTime(endTime)} ({(endTime - startTime).toFixed(1)}s)
                      </span>
                    </div>
                    <Slider
                      defaultValue={[startTime, endTime]}
                      min={0}
                      max={duration}
                      step={0.1}
                      value={[startTime, endTime]}
                      onValueChange={handleTimeRangeChange}
                      className="my-4"
                    />
                  </div>

                  <Tabs defaultValue="basic">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width (px)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            min={100}
                            max={800}
                          />
                          <p className="text-xs text-muted-foreground">Smaller width = faster conversion</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fps">Frames Per Second</Label>
                          <Input
                            id="fps"
                            type="number"
                            value={fps}
                            onChange={(e) => setFps(Number(e.target.value))}
                            min={5}
                            max={20}
                          />
                          <p className="text-xs text-muted-foreground">Lower FPS = smaller file size</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="advanced" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="quality">Quality (1-20, higher is better)</Label>
                        <Input
                          id="quality"
                          type="number"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          min={1}
                          max={20}
                        />
                        <p className="text-xs text-muted-foreground">Higher quality results in larger file size</p>
                      </div>
                      <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30">
                        <AlertDescription>
                          For best performance, keep clips under 5 seconds and use lower quality settings.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>

                  <Button
                    onClick={convertToGif}
                    disabled={isConverting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  >
                    {isConverting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Converting... {conversionProgress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="h-4 w-4 mr-2" />
                        Convert to GIF
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center">
                  {gifUrl ? (
                    <img
                      src={gifUrl || "/placeholder.svg"}
                      alt="Generated GIF"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Film className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your GIF will appear here</h3>
                      <p className="text-muted-foreground">
                        Adjust the settings and click "Convert to GIF" to see the result
                      </p>
                    </div>
                  )}
                </div>

                {gifUrl && (
                  <div className="space-y-4">
                    <Button
                      onClick={downloadGif}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download GIF
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      Your GIF is ready! Click the button above to download it.
                    </div>
                  </div>
                )}

                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <h3 className="font-medium mb-2">Tips for better GIFs</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Keep your GIFs short (2-5 seconds) for smaller file sizes</li>
                    <li>• Lower FPS (10-15) works well for most content</li>
                    <li>• Reduce the width for smaller file sizes and faster conversion</li>
                    <li>• Crop your video to focus on the important parts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>
    </div>
  )
}

// Helper function to format time in MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
