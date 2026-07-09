import React, { useRef } from 'react';

function Canvas() {
  const canvasRef = useRef(null);
  const isPainting = useRef(false);

  function startStroke(e) {
    isPainting.current = true;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function paint(e) {
    if (isPainting.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function stopStroke() {
    isPainting.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ border: '1px solid #ccc' }}
      onMouseDown={startStroke}
      onMouseMove={paint}
      onMouseUp={stopStroke}
    />
  );
};

export default Canvas;
