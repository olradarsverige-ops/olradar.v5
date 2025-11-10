'use client'
import React from 'react'
export function fireConfetti() {
  const el = document.createElement('div')
  el.style.position='fixed'; el.style.inset='0'; el.style.pointerEvents='none'; el.style.zIndex='9999'
  el.innerHTML='<div id="cfx" style="position:absolute;left:50%;top:40%"></div>'
  document.body.appendChild(el)
  const c = el.querySelector('#cfx') as HTMLElement
  const pieces = 80
  for(let i=0;i<pieces;i++){
    const p = document.createElement('div')
    p.style.position='absolute'; p.style.width='6px'; p.style.height='10px'
    p.style.background='hsl('+ (i*11%360) +',90%,60%)'
    p.style.transform=`translate(${(Math.random()*200-100)}px, ${(Math.random()*100-50)}px) rotate(${Math.random()*360}deg)`
    p.style.opacity='0'; p.style.transition='transform 900ms cubic-bezier(.2,.6,.2,1), opacity 900ms'
    c.appendChild(p)
    requestAnimationFrame(()=>{
      p.style.opacity='1'
      p.style.transform=`translate(${(Math.random()*600-300)}px, ${200+Math.random()*400}px) rotate(${Math.random()*360}deg)`
    })
  }
  setTimeout(()=> document.body.removeChild(el), 1100)
}
