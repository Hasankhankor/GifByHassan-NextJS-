"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "GIFLab has completely transformed how I create content for my social media. The editing tools are intuitive and the results are professional quality. I can't imagine using anything else!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marketing Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "As a marketing professional, I need tools that are both powerful and easy to use. GIFLab delivers on both fronts. Our engagement rates have increased by 40% since we started using GIFLab for our social campaigns.",
    rating: 5,
  },
  {
    id: 3,
    name: "Jessica Williams",
    role: "Social Media Influencer",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The speed at which I can create and share GIFs with GIFLab is incredible. What used to take me hours now takes minutes. The premium features are absolutely worth it!",
    rating: 4,
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "UX Designer",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "I use GIFLab to create UI demonstrations for my clients. The ability to add captions and highlight specific elements makes it perfect for showcasing interactive designs.",
    rating: 5,
  },
]

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState<typeof testimonials>([])

  useEffect(() => {
    // Determine how many testimonials to show based on screen size
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setVisibleTestimonials([testimonials[currentIndex]])
      } else if (width < 1024) {
        setVisibleTestimonials(testimonials.slice(currentIndex, currentIndex + 2))
      } else {
        setVisibleTestimonials(testimonials.slice(currentIndex, currentIndex + 3))
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [currentIndex])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= testimonials.length ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">What our users are saying</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
