'use client'
import { motion } from 'framer-motion'
import { Sun, Moon, Trophy, Bell, Share2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import React from 'react'

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button aria-label="Toggle dark mode" className="card-glass px-3 py-2 flex items-center gap-2 hover:scale-[1.02] transition" onClick={()=> setTheme(isDark?'light':'dark')}>
      {isDark ? <Sun size={18}/> : <Moon size={18}/>}
      <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
export const FadeIn: React.FC<React.PropsWithChildren<{delay?:number}>> = ({children, delay=0}) => (
  <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.4, delay}}>{children}</motion.div>
)
export function IconPill({icon, children}:{icon:React.ReactNode, children:React.ReactNode}){
  return <span className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-white/10 border border-white/10">{icon}{children}</span>
}
export function Chip({children}:{children:React.ReactNode}){ return <span className="px-2 py-0.5 rounded-full text-xs border border-white/20 bg-white/10">{children}</span> }
export function ShareButton({title, text, url}:{title?:string;text?:string;url?:string}){
  return (
    <button onClick={async()=>{ try{ if(navigator.share) await navigator.share({title,text,url}); else await navigator.clipboard.writeText(url||window.location.href); alert('Länk delad! 🍻') }catch{} }} className="card-glass px-3 py-2 hover:scale-[1.02] transition flex items-center gap-2">
      <Share2 size={16}/> Dela
    </button>
  )
}
export function BellButton({onClick}:{onClick:()=>void}){
  return <button onClick={onClick} className="card-glass px-3 py-2 hover:scale-[1.02] transition flex items-center gap-2"><Bell size={16}/> Deal Alert</button>
}
export function HypeCard({children}:{children:React.ReactNode}){ return <div className="card-glass p-4 hover:shadow-xl hover:-translate-y-0.5 transition">{children}</div> }
export function TrophyPill({points}:{points:number}){ return <IconPill icon={<Trophy size={14}/>}>{points} XP</IconPill> }
