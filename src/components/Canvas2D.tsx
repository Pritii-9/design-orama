import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Image as KonvaImage } from 'react-konva';
import { useDroppable } from '@dnd-kit/core';
import { FloorPlanElement } from '@/types/floorplan';
import Konva from 'konva';
import useImage from 'use-image';

const BackgroundImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src);
  
  if (!image) return null;
  
  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
      opacity={0.5}
    />
  );
};

interface Canvas2DProps {
  width: number;
  height: number;
  elements: FloorPlanElement[];
  selectedId: string | null;
  backgroundImage?: string | null;
  showGrid?: boolean;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<FloorPlanElement>) => void;
  onElementAdd: (element: Omit<FloorPlanElement, 'id'>) => void;
}

export const Canvas2D = ({
  width,
  height,
  elements,
  selectedId,
  backgroundImage,
  showGrid = true,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
}: Canvas2DProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  // Grid size
  const gridSize = 20;

  const generateGrid = () => {
    if (!showGrid) return [];
    
    const gridSize = 20;
    const lines = [];
    
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    
    return lines;
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.3, Math.min(3, newScale));

    setStageScale(clampedScale);

    const newPos = {
      x: pointerPosition.x - mousePointTo.x * clampedScale,
      y: pointerPosition.y - mousePointTo.y * clampedScale,
    };

    setStagePos(newPos);
    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const element = elements.find(el => el.id === id);
    if (!element) return;

    onElementUpdate(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleElementClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const id = e.target.id();
    onElementSelect(id);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area, deselect
    if (e.target === e.target.getStage()) {
      onElementSelect(null);
    }
  };

  const renderElement = (element: FloorPlanElement) => {
    const isSelected = element.id === selectedId;
    const commonProps = {
      key: element.id,
      id: element.id,
      x: element.x,
      y: element.y,
      draggable: true,
      onDragEnd: handleDragEnd,
      onClick: handleElementClick,
      stroke: isSelected ? 'hsl(var(--selection-color))' : 'hsl(var(--border))',
      strokeWidth: isSelected ? 2 : 1,
    };

    switch (element.type) {
      case 'wall':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill="hsl(var(--wall-color))"
          />
        );
      case 'furniture':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.color || 'hsl(var(--furniture-color))'}
            cornerRadius={4}
          />
        );
      case 'room':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill="transparent"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={setNodeRef}
      data-id="canvas"
      className="relative w-full h-full bg-canvas-bg border border-border rounded-lg overflow-hidden"
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
      >
        <Layer>
          {/* Background image */}
          {backgroundImage && (
            <BackgroundImage src={backgroundImage} width={width} height={height} />
          )}
          
          {generateGrid()}
          {elements.map(renderElement)}
          
          {/* Selection indicator */}
          {selectedId && (() => {
            const selectedElement = elements.find(el => el.id === selectedId);
            if (!selectedElement) return null;
            
            return (
              <Circle
                x={selectedElement.x + selectedElement.width / 2}
                y={selectedElement.y + selectedElement.height / 2}
                radius={8}
                fill="hsl(var(--primary))"
                stroke="white"
                strokeWidth={2}
                opacity={0.8}
              />
            );
          })()}
        </Layer>
      </Stage>

      {/* Canvas controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            setStageScale(1);
            setStagePos({ x: 0, y: 0 });
            if (stageRef.current) {
              stageRef.current.scale({ x: 1, y: 1 });
              stageRef.current.position({ x: 0, y: 0 });
            }
          }}
          className="px-3 py-1 bg-card text-card-foreground border border-border rounded shadow-soft hover:shadow-medium transition-all"
        >
          Reset View
        </button>
        <div className="px-3 py-1 bg-card text-card-foreground border border-border rounded shadow-soft text-sm">
          {Math.round(stageScale * 100)}%
        </div>
      </div>
    </div>
  );
};