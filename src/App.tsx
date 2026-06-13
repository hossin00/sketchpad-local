import { useState, useRef, useEffect, useCallback } from 'react'
import { Pen, Eraser, Square, Circle, Minus, Download, Trash2, Palette, Sliders } from 'lucide-react'

const COLORS = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#000000', '#6b7280', '#d946ef']

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line' | 'rect' | 'circle'>('pen')
  const [color, setColor] = useState('#d946ef')
  const [size, setSize] = useState(4)
  const [showPalette, setShowPalette] = useState(false)
  const [showSize, setShowSize] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const snapshotRef = useRef<ImageData | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    const saved = localStorage.getItem('sk_canvas')
    if (saved) {
      const img = new Image()
      img.onload = () => { ctx?.drawImage(img, 0, 0) }
      img.src = saved
    }
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const pos = getPos(e)
    setDrawing(true)
    startRef.current = pos
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }, [tool])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const pos = getPos(e)
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    if (tool === 'pen') {
      ctx.strokeStyle = color
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = size * 3
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (snapshotRef.current && startRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.strokeStyle = color
      ctx.globalCompositeOperation = 'source-over'
      const sx = startRef.current.x
      const sy = startRef.current.y
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(pos.x, pos.y)
      } else if (tool === 'rect') {
        ctx.rect(sx, sy, pos.x - sx, pos.y - sy)
      } else if (tool === 'circle') {
        const r = Math.sqrt(Math.pow(pos.x - sx, 2) + Math.pow(pos.y - sy, 2))
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
      }
      ctx.stroke()
    }
  }, [drawing, tool, color, size])

  const stopDraw = useCallback(() => {
    setDrawing(false)
    const canvas = canvasRef.current
    if (canvas) localStorage.setItem('sk_canvas', canvas.toDataURL())
  }, [])

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      localStorage.removeItem('sk_canvas')
    }
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'sketch.png'
    a.click()
  }

  const tools = [
    { id: 'pen', icon: <Pen size={18} />, label: 'Pen' },
    { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
    { id: 'line', icon: <Minus size={18} />, label: 'Line' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rect' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  ]

  return (
    <div style={{ background: '#0f0f1a', height: '100vh', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      <div style={{ background: '#1a1a2e', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a4e', flexShrink: 0 }}>
        <h1 style={{ color: '#d946ef', fontSize: 18, fontWeight: 800 }}>SketchPad</h1>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {tools.map(t => (
            <button key={t.id} title={t.label} onClick={() => setTool(t.id as typeof tool)} style={{ background: tool === t.id ? '#d946ef' : '#2a2a4e', border: 'none', borderRadius: 8, padding: '0.5rem', color: tool === t.id ? '#fff' : '#888', cursor: 'pointer' }}>{t.icon}</button>
          ))}
          <div style={{ width: 1, height: 24, background: '#2a2a4e', margin: '0 4px' }} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowPalette(!showPalette); setShowSize(false) }} style={{ background: '#2a2a4e', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: '2px solid #555' }} />
              <Palette size={14} style={{ color: '#888' }} />
            </button>
            {showPalette && (
              <div style={{ position: 'absolute', top: '120%', left: 0, background: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: 12, padding: '0.7rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, zIndex: 100, width: 180 }}>
                {COLORS.map(c => <div key={c} onClick={() => { setColor(c); setShowPalette(false) }} style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #fff' : '2px solid transparent' }} />)}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowSize(!showSize); setShowPalette(false) }} style={{ background: '#2a2a4e', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer' }}><Sliders size={16} style={{ color: '#888' }} /></button>
            {showSize && (
              <div style={{ position: 'absolute', top: '120%', right: 0, background: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: 12, padding: '1rem', zIndex: 100, width: 160 }}>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Size: {size}px</p>
                <input type="range" min={1} max={30} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            )}
          </div>
          <div style={{ width: 1, height: 24, background: '#2a2a4e', margin: '0 4px' }} />
          <button onClick={download} title="Download" style={{ background: '#2a2a4e', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#888', cursor: 'pointer' }}><Download size={16} /></button>
          <button onClick={clearCanvas} title="Clear" style={{ background: '#2a2a4e', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: '100%', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  )
}
