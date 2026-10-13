import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App(){
  const name = 'Tarık'
  const project = 'DitaCRM'
  const customers = 15

  return (
    <>
      <h1>Hello, {name}!</h1>
      <h2>{project}</h2>
      <p>Total customers: {customers}</p>
    </>
  )
}

export default App
