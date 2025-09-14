import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text } from 'react-konva';
import { useDroppable } from '@dnd-kit/core';
import { FloorPlanElement } from '@/types/floorplan';
import Konva from 'konva';

interface Canvas2DProps {
  width: number;
  height: number;
  elements: FloorPlanElement[];
  selectedId: string | null;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<FloorPlanElement>) => void;
  onElementAdd: (element: Omit<FloorPlanElement, 'id'>) => void;
}

export const Canvas2D = ({
  width,
  height,
  elements,
  selectedId,
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

  // Generate grid lines
  const generateGrid = () => {
    const lines = [];
    const canvasWidth = width * stageScale;
    const canvasHeight = height * stageScale;

    // Vertical lines
    for (let i = 0; i <= canvasWidth / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasHeight]}
          stroke="hsl(var(--canvas-grid))"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= canvasHeight / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, canvasWidth, i * gridSize]}
          stroke="hsl(var(--canvas-grid))"
          strokeWidth={0.5}
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
          {/* Grid */}
          {generateGrid()}
          
          {/* Elements */}
          {elements.map(renderElement)}
          
          {/* Selection indicator */}
          {selectedId && (() => {
            const selected = elements.find(el => el.id === selectedId);
            if (!selected) return null;
            return (
              <Circle
                x={selected.x + selected.width / 2}
                y={selected.y + selected.height / 2}
                radius={6}
                fill="hsl(var(--selection-color))"
                stroke="white"
                strokeWidth={2}
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