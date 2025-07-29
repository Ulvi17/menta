"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Shield,
  DollarSign,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  BookOpen,
  Target,
  Heart,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createChat } from '@n8n/chat';
import BagiraAI from "@/components/BagiraAI"
import { bagiraAIConfig } from "@/config/bagira-ai"

function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"chat" | "booking">("chat")
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help you with your study abroad journey. How can I assist you today?",
      sender: "support",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Booking state
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    studyField: "",
    preferredCountry: "",
  })

  const quickReplies = [
    "Tell me about pricing",
    "Which countries do you cover?",
    "How does the process work?",
    "I need scholarship help",
    "Book a consultation",
  ]

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    const currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() + 1) // Start from tomorrow

    while (dates.length < 10) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclude weekends
        dates.push({
          date: currentDate.toISOString().split("T")[0],
          display: currentDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  // Available time slots
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setIsTyping(true)

    // Handle booking request
    if (message === "Book a consultation") {
      setTimeout(() => {
        const supportResponse = {
          id: messages.length + 2,
          text: "I'd be happy to help you schedule a free consultation! Let me open our booking system for you.",
          sender: "support",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, supportResponse])
        setIsTyping(false)
        setTimeout(() => setCurrentView("booking"), 1000)
      }, 1500)
      return
    }

    // Simulate support response for other messages
    setTimeout(() => {
      const responses = {
        "Tell me about pricing":
          "Our complete guidance package is just ~1000 AZN/year with no hidden fees. This includes university matching, application support, scholarship assistance, and parent dashboard access. Would you like to schedule a free consultation to discuss your specific needs?",
        "Which countries do you cover?":
          "We work with universities across Europe, North America, Australia, and select Asian countries - over 500 accredited institutions! Popular destinations include Germany, Canada, Netherlands, and Australia. Which region interests you most?",
        "How does the process work?":
          "We start with a free consultation to understand your goals, then provide personalized university matching, step-by-step application guidance, and ongoing support. The typical timeline is 6-12 months. Would you like to book your free consultation?",
        "I need scholarship help":
          "Great! Scholarship support is included in our service. We identify relevant scholarships, help with applications, and many students receive partial or full funding. Let's discuss your profile in a consultation - shall I schedule one for you?",
      }

      const response =
        responses[message as keyof typeof responses] ||
        "Thanks for your message! Our expert counselors typically respond within 2-3 minutes. For immediate assistance, you can also book a free consultation. What specific area would you like help with?"

      const supportResponse = {
        id: messages.length + 2,
        text: response,
        sender: "support",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, supportResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email) {
      alert("Please fill in all required fields")
      return
    }

    // Simulate booking confirmation
    const confirmationMessage = {
      id: messages.length + 1,
      text: `Perfect! I've scheduled your free consultation for ${getAvailableDates().find((d) => d.date === selectedDate)?.display} at ${selectedTime}. You'll receive a confirmation email at ${bookingForm.email} with the meeting link. Looking forward to helping you with your study abroad journey!`,
      sender: "support",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, confirmationMessage])
    setCurrentView("chat")

    // Reset booking form
    setSelectedDate("")
    setSelectedTime("")
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      studyField: "",
      preferredCountry: "",
    })
  }

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 relative"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">{currentView === "booking" ? "Book Consultation" : "Menta Support"}</h3>
                <div className="flex items-center gap-1 text-xs text-emerald-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentView === "booking" && (
                <button
                  onClick={() => setCurrentView("chat")}
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat View */}
          {currentView === "chat" && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(reply)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Typically replies in 2-3 minutes</p>
              </div>
            </>
          )}

          {/* Booking View */}
          {currentView === "booking" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Select Date</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableDates().map((date) => (
                      <button
                        key={date.date}
                        onClick={() => setSelectedDate(date.date)}
                        className={`p-2 text-xs rounded border transition-colors ${
                          selectedDate === date.date
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-emerald-600"
                        }`}
                      >
                        {date.display}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Select Time</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-xs rounded border transition-colors ${
                            selectedTime === time
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-emerald-600"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Your Details</h4>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={bookingForm.studyField}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, studyField: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Preferred Country"
                      value={bookingForm.preferredCountry}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, preferredCountry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      onClick={handleBookingSubmit}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                      Confirm Booking
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Free 30-minute consultation • No commitment required
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function MentaLanding() {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://primary-w2wb-edtechstudio.up.railway.app/webhook/ded3cc1d-58d8-4747-823a-1b2b5cb973db/chat'
    });
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">Menta</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 ml-auto">
            <Link href="#features" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    Transform Your Study Abroad Journey
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                    From Confusion to <span className="text-emerald-600">Clarity</span>, From Anxiety to{" "}
                    <span className="text-emerald-600">Confidence</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Navigate your study abroad journey with personalized guidance, transparent processes, and expert
                    support. Make informed decisions that lead to success.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 justify-center">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Expert guidance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Proven results</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/images/students-celebrating.jpg"
                  width="600"
                  height="400"
                  alt="Students celebrating success"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bagira AI Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    AI-Powered Consultation
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                    Talk to <span className="text-blue-600">Bagira AI</span> Assistant
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                    Get instant answers to your study abroad questions. Our AI assistant is here to guide you through 
                    the process, answer your queries, and help you make informed decisions about your education journey.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">24/7 availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Instant responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Personalized guidance</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <BagiraAI
                  vapiPublicKey={bagiraAIConfig.vapiPublicKey}
                  supabaseUrl={bagiraAIConfig.supabaseUrl}
                  supabaseAnonKey={bagiraAIConfig.supabaseAnonKey}
                  channel={bagiraAIConfig.channel}
                  assistantId={bagiraAIConfig.assistantId}
                  webhookUrl={bagiraAIConfig.webhookUrl}
                  phoneImageSrc="/phone.svg"
                  buttonSize="lg"
                  buttonColor="bg-blue-600/80"
                  activeButtonColor="bg-red-600/80"
                  modalTitle="Confirm your consultation"
                  formFields={{ name: true, phone: true, email: true }}
                  onCallStart={(callId) => console.log('Call started:', callId)}
                  onFormSubmit={async (formData, callId) => {
                    console.log('Form submitted:', formData, callId);
                    // Custom form submission logic here
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Escape the Overwhelm Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <Image
                src="/images/organized-study-process.jpg"
                width="550"
                height="400"
                alt="Organized study abroad process"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-lg"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-800">
                    <Target className="mr-2 h-4 w-4" />
                    Escape the Overwhelm
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                    Clear Path Through the Maze
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                    Stop feeling lost in endless university options and complex applications. Our personalized,
                    data-driven guidance provides structured, step-by-step support tailored to your goals.
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Personalized University Matching</h3>
                      <p className="text-gray-600">
                        AI-powered recommendations based on your profile, goals, and preferences
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Step-by-Step Application Guide</h3>
                      <p className="text-gray-600">Break down complex processes into manageable, trackable tasks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Real-Time Progress Tracking</h3>
                      <p className="text-gray-600">Never lose track of deadlines, requirements, or next steps</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Affordable Dreams Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[500px_1fr] lg:gap-12 xl:grid-cols-[550px_1fr]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Affordable Dreams, Not Debt
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                    Quality Education Without Breaking the Bank
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                    Don't let financial fears hold you back. Our affordable platform and scholarship support make study
                    abroad accessible to everyone.
                  </p>
                </div>
                <div className="space-y-4">
                  <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-emerald-800">~1000 AZN/year</h3>
                          <p className="text-emerald-700">Complete guidance package</p>
                        </div>
                        <Badge className="bg-emerald-600 text-white">Best Value</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <ul className="grid gap-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-gray-700">Scholarship identification and application support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-gray-700">Budget planning and financial guidance</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-gray-700">Cost-effective university recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Image
                src="/images/affordable-education.jpg"
                width="550"
                height="400"
                alt="Affordable education concept"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-lg lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Trusted Path Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <Image
                src="/images/trusted-guidance.jpg"
                width="550"
                height="400"
                alt="Trusted guidance and success"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-lg"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    <Shield className="mr-2 h-4 w-4" />
                    Trusted Path to Success
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                    Transparent, Expert-Led Journey
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                    No more worrying about scams or untrustworthy agencies. Our transparent process and expert guidance
                    ensure your safety and success.
                  </p>
                </div>
                <div className="grid gap-4">
                  <Card className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">High Earning Potential</h3>
                          <p className="text-gray-600 text-sm">
                            Focus on programs with strong career prospects and job opportunities
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-emerald-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">100% Transparent Process</h3>
                          <p className="text-gray-600 text-sm">
                            Every step documented, every fee disclosed, every decision explained
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-emerald-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Expert Guidance</h3>
                          <p className="text-gray-600 text-sm">
                            Certified counselors with proven track records in study abroad success
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Peace of Mind for Parents */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[500px_1fr] lg:gap-12 xl:grid-cols-[550px_1fr]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">
                    <Heart className="mr-2 h-4 w-4" />
                    Peace of Mind for Parents
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                    Stay Informed, Stay in Control
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                    As a parent, you want the best for your child. Our transparent, trackable process keeps you informed
                    every step of the way, ensuring confident decision-making.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Parent Dashboard Access</h3>
                      <p className="text-gray-600">
                        Track your child's progress, view all communications, and stay updated on milestones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Market Insights & Trends</h3>
                      <p className="text-gray-600">
                        Stay informed about job market trends and career prospects in chosen fields
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Safety & Security Assurance</h3>
                      <p className="text-gray-600">
                        Comprehensive safety information and support for international students
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Image
                src="/images/parents-student-planning.jpg"
                width="550"
                height="400"
                alt="Parents and student planning together"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-lg lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Success Stories</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
                  Hear from students and parents who transformed their study abroad dreams into reality
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Menta made the overwhelming process so clear and manageable. I got into my dream university in
                    Germany with a scholarship I never knew existed!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">A</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Aysel M.</p>
                      <p className="text-sm text-gray-600">Computer Science Student, TU Berlin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "As a parent, I was worried about the process and costs. Menta's transparency and parent dashboard
                    gave me complete peace of mind."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">R</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Rashad A.</p>
                      <p className="text-sm text-gray-600">Parent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
                  One affordable price for complete guidance. No hidden fees, no surprises.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-md py-12">
              <Card className="border-2 border-emerald-600 shadow-lg">
                <CardHeader className="text-center">
                  <Badge className="bg-emerald-600 text-white w-fit mx-auto mb-4">Most Popular</Badge>
                  <CardTitle className="text-3xl font-bold text-gray-900">Complete Package</CardTitle>
                  <CardDescription className="text-gray-600">
                    Everything you need for study abroad success
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-emerald-600">~1000 AZN</span>
                    <span className="text-gray-600">/year</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Personalized university matching</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Step-by-step application guidance</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Scholarship identification & support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Parent dashboard access</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Expert counselor support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span>Progress tracking & deadlines</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                    Start Your Journey Today
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
                  Get answers to common questions about study abroad and our services
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-4xl">
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    How is Menta different from other study abroad agencies?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Unlike traditional agencies, Menta offers complete transparency with no hidden fees, AI-powered
                    personalized matching, and a parent dashboard for full visibility. We focus on affordable solutions
                    (~1000 AZN/year) compared to agencies charging 5000+ AZN, and provide ongoing support throughout
                    your entire journey.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    What exactly is included in the 1000 AZN annual fee?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Your fee includes personalized university matching, complete application guidance, scholarship
                    identification and application support, document preparation assistance, visa guidance, parent
                    dashboard access, dedicated counselor support, progress tracking, and pre-departure orientation. No
                    additional charges for consultations or revisions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    How do you ensure my safety and avoid scams?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    We only work with accredited universities and verified programs. All our processes are transparent
                    and documented in your dashboard. We provide detailed safety information about destination
                    countries, connect you with current students, and offer 24/7 emergency support. Our counselors are
                    certified professionals with proven track records.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    Can parents track their child's progress?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes! Parents get full access to a dedicated dashboard where they can track application progress,
                    view all communications, monitor deadlines, and receive regular updates. We believe parents should
                    be informed partners in this important decision, not left in the dark.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    What if I don't get accepted to any universities?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our success rate is over 95% because we use data-driven matching to recommend universities where you
                    have strong acceptance chances. If you follow our guidance and don't receive any acceptances, we'll
                    work with you for an additional semester at no extra cost to find suitable alternatives.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    How long does the entire process take?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    The timeline varies by destination and program, but typically takes 6-12 months from initial
                    consultation to departure. We create a personalized timeline for you with all key milestones and
                    deadlines. Starting early gives you the best chance for scholarships and preferred program
                    placement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    Do you help with scholarships and financial aid?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Scholarship support is a core part of our service. We identify relevant scholarships based on your
                    profile, help with applications, and provide guidance on financial planning. Many of our students
                    receive partial or full scholarships, significantly reducing their study costs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    What support do you provide after I arrive at university?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Our support continues after you arrive! We provide orientation sessions, connect you with local
                    student communities, offer academic and cultural adjustment guidance, and maintain regular check-ins
                    during your first semester. We're here for the long term, not just until you get accepted.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    Which countries and universities do you work with?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    We work with universities across Europe, North America, Australia, and select Asian countries. Our
                    database includes over 500 accredited institutions ranging from top-tier research universities to
                    specialized colleges. We focus on programs with strong career prospects and reasonable costs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    How do I get started with Menta?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Simply click "Get Started" to book your free initial consultation. We'll assess your goals, academic
                    background, and preferences, then create a personalized roadmap for your study abroad journey. No
                    commitment required for the first consultation - we want to make sure we're the right fit for you.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                Contact Our Experts
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                  Ready to Transform Your Future?
                </h2>
                <p className="max-w-[600px] text-emerald-100 md:text-xl/relaxed">
                  Join thousands of students who've successfully navigated their study abroad journey with Menta. Your
                  dream education awaits.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-emerald-100"
                  />
                  <Button type="submit" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-emerald-100">Start your free consultation today. No commitment required.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 border-t bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col gap-2 sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-gray-900">Menta</span>
          </div>
          <p className="text-xs text-gray-600 sm:ml-4">© 2024 Menta. Transforming study abroad dreams into reality.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
              Contact
            </Link>
          </nav>
        </div>
      </footer>

      {/* Live Chat Widget */}
      {/* <LiveChatWidget /> */}
    </div>
  )
}
