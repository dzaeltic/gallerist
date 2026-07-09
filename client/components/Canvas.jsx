import React, { useEffect, useRef, useState } from 'react';

function Canvas() {
  const paintCanvasRef = useRef(null);
  const isPainting = useRef(false);
  const [brushSize, setBrushSize] = useState(15);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('brush');
  const undoHistory = useRef([]);
  const redoHistory = useRef([]);

  useEffect(() => {
    function handleShortcut(e) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        moveHistory(true);
      }
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        moveHistory(false);
      }
    }

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  function startStroke(e) {
    isPainting.current = true;
    const ctx = paintCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function paint(e) {
    if (!isPainting.current) return;
    const ctx = paintCanvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    tool === 'brush'
      ? ctx.globalCompositeOperation = 'source-over'
      : ctx.globalCompositeOperation = 'destination-out';
    ctx.stroke();
  }

  function stopStroke() {
    isPainting.current = false;
    undoHistory.current.push(paintCanvasRef.current.toDataURL());
  }

  function adjustBrushSize(e) {
    setBrushSize(Number(e.target.value));
  }

  function adjustColor(e) {
    setColor(e.target.value);
  }

  function moveHistory(undone) {
    if (!undoHistory.current.length && undone) return;
    if (!redoHistory.current.length && !undone) return;
    const canvas = paintCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    undone 
      ? redoHistory.current.push(undoHistory.current.pop())
      : undoHistory.current.push(redoHistory.current.pop());
    img.src = undoHistory.current[undoHistory.current.length - 1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  return (
    <div>
      <div>
        <h2>Brush Size</h2>
        <input
          type="range"
          min="0.5"
          max="15"
          step="0.1"
          value={brushSize}
          onChange={adjustBrushSize}
        />
      </div>
      <div>
        <h2>Color Picker</h2>
        <input
          type="color"
          value={color}
          onChange={adjustColor}
        />
      </div>
      <div>
        <h2>Brush</h2>
        <button
          type="button"
          onClick={() => setTool('brush')}
        >
          B
        </button>
      </div>
      <div>
        <h2>Eraser</h2>
        <button
          type="button"
          onClick={() => setTool('eraser')}
        >
          E
        </button>
      </div>
      <div>
        <h2>Undo</h2>
        <button
          type="button"
          onClick={() => moveHistory(true)}
        >
          U
        </button>
        <h2>Redo</h2>
        <button
          type="button"
          onClick={() => moveHistory(false)}
        >
          R
        </button>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={paintCanvasRef}
          style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            border: '2px solid #ccc',
          }}
          width={600}
          height={400}
          onMouseDown={startStroke}
          onMouseMove={paint}
          onMouseUp={stopStroke}
        />
      </div>
    </div>
  );
}

export default Canvas;
