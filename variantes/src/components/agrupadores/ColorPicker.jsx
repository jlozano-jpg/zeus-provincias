import { useRef, useState, useEffect } from 'react'
import { IconX, IconCheck } from '@tabler/icons-react'

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

export default function ColorPicker({ initialHex, onConfirm, onClose }) {
  const wheelRef = useRef(null)
  const [hue, setHue] = useState(280)
  const [sat, setSat] = useState(60)
  const [light, setLight] = useState(60)
  const [pos, setPos] = useState({ x: 0.35, y: 0.5 })

  const hex = hslToHex(hue, sat, light)

  useEffect(() => {
    if (!initialHex) return
  }, [initialHex])

  function handleWheelPointer(e) {
    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const x = e.clientX - rect.left - cx
    const y = e.clientY - rect.top - cy
    const r = Math.min(Math.sqrt(x * x + y * y) / cx, 1)
    const h = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
    setHue(h)
    setSat(Math.round(r * 100))
    setPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }

  function startDrag(e) {
    handleWheelPointer(e)
    const move = (ev) => handleWheelPointer(ev)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="va-cp-overlay" onClick={onClose}>
      <div className="va-cp-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="va-cp-head">
          <div className="va-cp-title">Elegí un color</div>
          <button type="button" className="va-btn-icon" onClick={onClose} aria-label="Cerrar">
            <IconX size={16} stroke={1.6} />
          </button>
        </div>

        <div className="va-cp-wheel-wrap">
          <div className="va-cp-wheel" ref={wheelRef} onPointerDown={startDrag}>
            <div className="va-cp-puck" style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }} />
          </div>
        </div>

        <div className="va-cp-slider-row">
          <input
            type="range"
            min="5"
            max="95"
            value={light}
            onChange={(e) => setLight(parseInt(e.target.value, 10))}
            className="va-cp-slider"
            style={{ background: `linear-gradient(to right, #000, hsl(${hue}, ${sat}%, 50%), #fff)` }}
          />
        </div>

        <div className="va-cp-result">
          <div className="va-cp-hex">
            <span className="va-cp-hex-label">HEX</span>
            <span className="va-cp-hex-value">{hex}</span>
          </div>
          <div className="va-cp-swatch" style={{ background: hex }} />
        </div>

        <div className="va-cp-actions">
          <button type="button" className="va-btn va-btn-secondary va-btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="va-btn va-btn-primary va-btn-sm" onClick={() => onConfirm(hex)}>
            <IconCheck size={14} stroke={2} /> Usar color
          </button>
        </div>
      </div>
    </div>
  )
}
