import Image from "next/image"
import { Upload, Edit, Share2 } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="grid gap-8 py-8 md:grid-cols-3">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Upload className="h-10 w-10 text-purple-500" />
          </div>
          <div className="absolute top-0 right-0 -mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">
            1
          </div>
        </div>
        <h3 className="text-xl font-bold">Upload Your Video</h3>
        <p className="text-muted-foreground">
          Drag and drop your video or screen recording directly into the editor. We support all major video formats.
        </p>
        <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border shadow-sm">
          <Image
            src="/placeholder.svg?height=200&width=300"
            width={300}
            height={200}
            alt="Upload interface"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Edit className="h-10 w-10 text-purple-500" />
          </div>
          <div className="absolute top-0 right-0 -mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">
            2
          </div>
        </div>
        <h3 className="text-xl font-bold">Edit and Customize</h3>
        <p className="text-muted-foreground">
          Trim your video, add captions, apply filters, and overlay stickers to make your GIF stand out.
        </p>
        <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border shadow-sm">
          <Image
            src="/placeholder.svg?height=200&width=300"
            width={300}
            height={200}
            alt="Editing interface"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Share2 className="h-10 w-10 text-purple-500" />
          </div>
          <div className="absolute top-0 right-0 -mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">
            3
          </div>
        </div>
        <h3 className="text-xl font-bold">Save and Share</h3>
        <p className="text-muted-foreground">
          Download your GIF or share it directly to social media with just one click. Get a shareable link instantly.
        </p>
        <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border shadow-sm">
          <Image
            src="/placeholder.svg?height=200&width=300"
            width={300}
            height={200}
            alt="Sharing interface"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
