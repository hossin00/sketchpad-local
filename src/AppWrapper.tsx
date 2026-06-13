import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'sketchpad-local_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Canvas drawing tools", "Layers and opacity", "Pen pressure simulation", "Export PNG and SVG"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#d946ef" color2="#c026d3" emoji="🖊️" name="SketchPad Local" tagline="Digital drawing and sketching canvas"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#d946ef" emoji="🖊️" name="SketchPad Local" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}