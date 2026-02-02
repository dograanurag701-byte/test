"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type GameStage = "welcome" | "letters" | "question" | "celebration"

interface FloatingLetter {
  id: number
  letter: string
  x: number
  y: number
  speed: number
}

const TARGET_WORD = "LOVE"
const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const hearts = [
  { id: 1, left: 5, delay: 0, duration: 12, size: 20 },
  { id: 2, left: 20, delay: 2, duration: 14, size: 28 },
  { id: 3, left: 35, delay: 1, duration: 10, size: 22 },
  { id: 4, left: 50, delay: 3, duration: 16, size: 32 },
  { id: 5, left: 65, delay: 0.5, duration: 11, size: 18 },
  { id: 6, left: 80, delay: 4, duration: 13, size: 26 },
  { id: 7, left: 95, delay: 1.5, duration: 15, size: 24 },
]

const noMessages = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "Last chance!",
  "Surely not?",
  "Please?",
  "Pretty please?",
]

function HeartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-primary animate-float-up"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
            opacity: 0.4,
          }}
        >
          <HeartIcon className="w-[1em] h-[1em]" />
        </div>
      ))}
    </div>
  )
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardContent className="pt-10 pb-12 px-8">
        <div className="text-center space-y-8">
          <div className="animate-bounce">
            <HeartIcon className="w-20 h-20 mx-auto text-primary drop-shadow-lg" />
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground text-lg">A special message for</p>
            <h1 className="text-5xl font-bold text-foreground tracking-tight">Ninni</h1>
          </div>
          
          <p className="text-muted-foreground">
            I have something important to ask you...
          </p>
          
          <Button
            onClick={onStart}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg px-8"
          >
            Open Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LetterGame({ onComplete }: { onComplete: () => void }) {
  const [collected, setCollected] = useState("")
  const [letters, setLetters] = useState<FloatingLetter[]>([])
  const [nextId, setNextId] = useState(0)

  const spawnLetter = useCallback(() => {
    const neededLetter = TARGET_WORD[collected.length]
    const isTarget = Math.random() < 0.4
    const letter = isTarget && neededLetter ? neededLetter : ALL_LETTERS[Math.floor(Math.random() * 26)]
    
    const newLetter: FloatingLetter = {
      id: nextId,
      letter,
      x: Math.random() * 80 + 10,
      y: 100,
      speed: 0.3 + Math.random() * 0.3,
    }
    
    setNextId(prev => prev + 1)
    setLetters(prev => {
      const updated = [...prev, newLetter]
      if (updated.length > 10) {
        return updated.slice(1)
      }
      return updated
    })
  }, [collected.length, nextId])

  useEffect(() => {
    const spawnInterval = setInterval(spawnLetter, 800)
    return () => clearInterval(spawnInterval)
  }, [spawnLetter])

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setLetters(prev => {
        const moved: FloatingLetter[] = []
        for (let i = 0; i < prev.length; i++) {
          const letter = prev[i]
          const newY = letter.y - letter.speed
          if (newY > -10) {
            moved.push({ ...letter, y: newY })
          }
        }
        return moved
      })
    }, 50)
    return () => clearInterval(moveInterval)
  }, [])

  const handleLetterClick = (letter: FloatingLetter) => {
    const neededLetter = TARGET_WORD[collected.length]
    if (letter.letter === neededLetter) {
      const newCollected = collected + letter.letter
      setCollected(newCollected)
      setLetters(prev => {
        const filtered: FloatingLetter[] = []
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== letter.id) {
            filtered.push(prev[i])
          }
        }
        return filtered
      })
      
      if (newCollected === TARGET_WORD) {
        setTimeout(onComplete, 500)
      }
    }
  }

  return (
    <Card className="w-full max-w-lg mx-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardContent className="pt-8 pb-10 px-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Click letters to spell</p>
            <h2 className="text-3xl font-bold text-foreground tracking-wider">
              {TARGET_WORD.split("").map((char, i) => (
                <span
                  key={i}
                  className={i < collected.length ? "text-primary" : "text-muted-foreground/30"}
                >
                  {char}
                </span>
              ))}
            </h2>
          </div>

          <div className="relative h-80 bg-gradient-to-b from-primary/5 to-primary/10 rounded-xl overflow-hidden border border-primary/20">
            {letters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => handleLetterClick(letter)}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-transform hover:scale-110 cursor-pointer ${
                  letter.letter === TARGET_WORD[collected.length]
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-secondary-foreground"
                }`}
                style={{
                  left: `${letter.x}%`,
                  bottom: `${letter.y}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {letter.letter}
              </button>
            ))}
            
            {letters.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Letters are coming...</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Find the letter <span className="font-bold text-primary">{TARGET_WORD[collected.length] || "!"}</span> to continue
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionCard({ onAccept }: { onAccept: () => void }) {
  const [noCount, setNoCount] = useState(0)
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 })

  const yesScale = Math.min(1 + noCount * 0.3, 3)

  const moveButton = () => {
    if (noCount >= 2) {
      const newX = (Math.random() - 0.5) * 200
      const newY = (Math.random() - 0.5) * 150
      setButtonPos({ x: newX, y: newY })
    }
  }

  const handleNo = () => {
    setNoCount(noCount + 1)
    moveButton()
  }

  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardContent className="pt-8 pb-10 px-8">
        <div className="text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">The Big Question</span>
          </div>

          <div className="relative mx-auto w-24 h-24">
            <HeartIcon className="w-full h-full text-primary drop-shadow-lg animate-pulse" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-lg">Hey</p>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Ninni</h1>
          </div>

          <div className="py-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-balance leading-relaxed">
              Will you be my Valentine?
            </h2>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 min-h-[140px] relative">
            <Button
              onClick={onAccept}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300 z-10"
              style={{
                transform: `scale(${yesScale})`,
                transformOrigin: "center",
              }}
            >
              Yes!
            </Button>

            <Button
              variant="outline"
              onClick={handleNo}
              onMouseEnter={moveButton}
              onTouchStart={moveButton}
              className="border-2 border-muted-foreground/30 text-muted-foreground hover:bg-secondary transition-all font-medium bg-transparent absolute"
              style={{
                transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
                transition: noCount >= 2 ? "transform 0.15s ease-out" : "none",
                right: "20%",
              }}
            >
              {noMessages[Math.min(noCount, noMessages.length - 1)]}
            </Button>
          </div>

          {noCount > 0 && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {noCount < 2
                ? "Come on, give me a chance!"
                : noCount < 4
                ? "The No button is getting nervous..."
                : "Haha, you can't catch that button!"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Celebration() {
  return (
    <Card className="w-full max-w-lg mx-4 shadow-2xl border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
      <CardContent className="pt-10 pb-12 px-8">
        <div className="text-center space-y-8">
          <div className="animate-bounce">
            <HeartIcon className="w-32 h-32 mx-auto text-primary drop-shadow-xl" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight animate-pulse">
              Yay!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              I knew you&apos;d say yes!
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-2xl md:text-3xl font-semibold text-foreground">
              I love you, Ninni!
            </p>
            <p className="text-lg text-muted-foreground">
              You just made me the happiest person ever
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
              <HeartIcon
                key={i}
                className="w-6 h-6 text-primary animate-pulse"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ValentinePage() {
  const [stage, setStage] = useState<GameStage>("welcome")

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <FloatingHearts />

      {stage === "welcome" && <WelcomeScreen onStart={() => setStage("letters")} />}
      {stage === "letters" && <LetterGame onComplete={() => setStage("question")} />}
      {stage === "question" && <QuestionCard onAccept={() => setStage("celebration")} />}
      {stage === "celebration" && <Celebration />}
    </main>
  )
}
