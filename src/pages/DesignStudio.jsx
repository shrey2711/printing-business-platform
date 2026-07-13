import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PALETTE = ['#16233b', '#c8102e', '#1f8fd6', '#2f9e44', '#ffcf3f', '#ffffff', '#000000'];

export default function DesignStudio() {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const product = params.get('product') || 'Custom Design';

  const [color, setColor] = useState('#c8102e');
  const [mode, setMode] = useState('select');

  // Initialize the fabric canvas once.
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: 820,
      height: 500,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
    });
    canvas.freeDrawingBrush.color = '#c8102e';
    canvas.freeDrawingBrush.width = 4;
    fabricRef.current = canvas;

    const handleKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      canvas.dispose();
    };
  }, []);

  const canvas = () => fabricRef.current;

  const setDraw = (on) => {
    const c = canvas();
    c.isDrawingMode = on;
    setMode(on ? 'draw' : 'select');
  };

  const applyColor = (value) => {
    setColor(value);
    const c = canvas();
    c.freeDrawingBrush.color = value;
    const obj = c.getActiveObject();
    if (obj) {
      obj.set(obj.type === 'i-text' ? 'fill' : 'fill', value);
      c.requestRenderAll();
    }
  };

  const addRect = () => {
    setDraw(false);
    const c = canvas();
    const rect = new fabric.Rect({ left: 120, top: 120, width: 160, height: 100, fill: color });
    c.add(rect).setActiveObject(rect);
    c.requestRenderAll();
  };

  const addCircle = () => {
    setDraw(false);
    const c = canvas();
    const circle = new fabric.Circle({ left: 150, top: 150, radius: 60, fill: color });
    c.add(circle).setActiveObject(circle);
    c.requestRenderAll();
  };

  const addText = () => {
    setDraw(false);
    const c = canvas();
    const text = new fabric.IText('Your text', {
      left: 140, top: 140, fontFamily: 'Arial', fontSize: 44, fill: color, fontWeight: 'bold'
    });
    c.add(text).setActiveObject(text);
    c.requestRenderAll();
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, (img) => {
        const c = canvas();
        const scale = Math.min(400 / img.width, 300 / img.height, 1);
        img.set({ left: 90, top: 90, scaleX: scale, scaleY: scale });
        c.add(img).setActiveObject(img);
        c.requestRenderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const setBg = (value) => {
    const c = canvas();
    c.setBackgroundColor(value, () => c.requestRenderAll());
  };

  const deleteSelected = () => {
    const c = canvas();
    const active = c.getActiveObjects();
    active.forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.requestRenderAll();
  };

  const clearAll = () => {
    const c = canvas();
    c.getObjects().forEach((o) => c.remove(o));
    c.setBackgroundColor('#ffffff', () => c.requestRenderAll());
  };

  const submitDesign = () => {
    const c = canvas();
    const dataUrl = c.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    navigate('/order', { state: { product, design: dataUrl, specs: 'Custom design created in Design Studio' } });
  };

  return (
    <main className="page">
      <div className="studio-head">
        <div>
          <span className="eyebrow">Design Studio</span>
          <h1>Create your artwork</h1>
          <p className="muted">Draw, add text and shapes, or drop in an image — then submit it for printing.</p>
        </div>
        <Link className="back-link" to="/products">← Back to products</Link>
      </div>

      <div className="studio-layout">
        <div className="studio-toolbar card">
          <div className="tool-group">
            <span className="tool-label">Tools</span>
            <button className={`tool ${mode === 'select' ? 'tool-on' : ''}`} onClick={() => setDraw(false)}>▤ Select</button>
            <button className={`tool ${mode === 'draw' ? 'tool-on' : ''}`} onClick={() => setDraw(true)}>✎ Draw</button>
            <button className="tool" onClick={addText}>T Text</button>
            <button className="tool" onClick={addRect}>▭ Rectangle</button>
            <button className="tool" onClick={addCircle}>◯ Circle</button>
            <label className="tool">
              🖼 Image
              <input type="file" accept="image/*" hidden onChange={uploadImage} />
            </label>
          </div>

          <div className="tool-group">
            <span className="tool-label">Color</span>
            <div className="swatches">
              {PALETTE.map((c) => (
                <button key={c} className={`swatch ${color === c ? 'swatch-on' : ''}`}
                  style={{ background: c }} onClick={() => applyColor(c)} aria-label={c} />
              ))}
              <input type="color" value={color} onChange={(e) => applyColor(e.target.value)} />
            </div>
          </div>

          <div className="tool-group">
            <span className="tool-label">Canvas</span>
            <button className="tool" onClick={() => setBg('#ffffff')}>White bg</button>
            <button className="tool" onClick={() => setBg(color)}>Fill bg</button>
            <button className="tool" onClick={deleteSelected}>🗑 Delete</button>
            <button className="tool tool-danger" onClick={clearAll}>Clear all</button>
          </div>

          <button className="btn btn-red btn-block" onClick={submitDesign}>
            Use this design → Order
          </button>
          {!isAuthenticated && (
            <p className="panel-foot">You'll sign in before the order is submitted.</p>
          )}
        </div>

        <div className="studio-canvas-wrap">
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </main>
  );
}
