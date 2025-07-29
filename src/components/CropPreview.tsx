import React from 'react';

interface CropArea {
  x: number; // 0..1
  y: number; // 0..1
  width: number; // 0..1
  height: number; // 0..1
}

interface CropPreviewProps {
  imageUrl: string; // base64 url
  cropAreas: CropArea[]; // array of crop area (rasio)
  highlightIndex?: number; // index area yang di-highlight
  style?: React.CSSProperties;
}

const borderColors = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e42', // orange
  '#ef4444', // red
  '#a855f7', // purple
  '#f43f5e', // pink
  '#14b8a6', // teal
  '#eab308', // yellow
];

export default function CropPreview({ imageUrl, cropAreas, highlightIndex, style }: CropPreviewProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <img
        src={imageUrl}
        alt="Preview"
        style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px #0002', display: 'block' }}
      />
      {cropAreas.map((area, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${area.x * 100}%`,
            top: `${area.y * 100}%`,
            width: `${area.width * 100}%`,
            height: `${area.height * 100}%`,
            border: `2px solid ${borderColors[i % borderColors.length]}`,
            boxSizing: 'border-box',
            borderRadius: 4,
            pointerEvents: 'none',
            boxShadow: highlightIndex === i ? '0 0 0 3px #fbbf24cc' : undefined,
            zIndex: 2,
            transition: 'box-shadow 0.2s',
          }}
          title={`Crop Area ${i + 1}`}
        />
      ))}
    </div>
  );
}
