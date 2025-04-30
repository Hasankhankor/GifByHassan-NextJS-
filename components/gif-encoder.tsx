/**
 * GIF Encoder using gif.js library
 * Modified to work without external workers to avoid CORS issues
 */

interface GifEncoderOptions {
  width: number
  height: number
  quality?: number
  fps?: number
  onProgress?: (progress: number) => void
}

export default class GifEncoder {
  private width: number
  private height: number
  private quality: number
  private fps: number
  private onProgress?: (progress: number) => void
  private gif: any
  private frameCount = 0
  private expectedFrames = 0

  constructor(options: GifEncoderOptions) {
    this.width = options.width
    this.height = options.height
    this.quality = options.quality || 10
    this.fps = options.fps || 10
    this.onProgress = options.onProgress
  }

  async start(): Promise<void> {
    // Dynamically import the GIF.js script
    await this.loadGifJsLibrary()

    // Create a new GIF instance without workers to avoid CORS issues
    // @ts-ignore - GIF is loaded dynamically
    this.gif = new GIF({
      workers: 0, // Use 0 workers to avoid CORS issues with worker scripts
      quality: 21 - this.quality, // GIF.js uses 1-30 quality (lower is better), so we invert our 1-20 scale
      width: this.width,
      height: this.height,
    })

    // Set up progress handler
    if (this.onProgress) {
      this.gif.on("progress", (progress: number) => {
        this.onProgress?.(progress)
      })
    }

    this.frameCount = 0
    return Promise.resolve()
  }

  async addFrame(imageData: ImageData): Promise<void> {
    if (!this.gif) {
      throw new Error("GIF encoder not initialized. Call start() first.")
    }

    // Create a canvas to draw the frame
    const canvas = document.createElement("canvas")
    canvas.width = this.width
    canvas.height = this.height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0)

    // Add the canvas as a frame to the GIF
    // Set the delay based on FPS (in 1/100 of a second)
    this.gif.addFrame(canvas, { delay: Math.round(100 / this.fps), copy: true })

    this.frameCount++
    return Promise.resolve()
  }

  setExpectedFrames(count: number): void {
    this.expectedFrames = count
  }

  async finish(): Promise<Blob> {
    if (!this.gif) {
      throw new Error("GIF encoder not initialized. Call start() first.")
    }

    return new Promise<Blob>((resolve, reject) => {
      // When rendering is finished, resolve with the blob
      this.gif.on("finished", (blob: Blob) => {
        resolve(blob)
      })

      // Start rendering the GIF
      this.gif.render()
    })
  }

  private async loadGifJsLibrary(): Promise<void> {
    // Check if GIF.js is already loaded
    if (window.GIF) {
      return Promise.resolve()
    }

    // Load GIF.js from CDN
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/gh/jnordberg/gif.js/dist/gif.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load GIF.js library"))
      document.head.appendChild(script)
    })
  }
}

// Add this to make TypeScript happy with the global GIF object
declare global {
  interface Window {
    GIF: any
  }
}
