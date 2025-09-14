import { useDraggable } from '@dnd-kit/core';
import { FurnitureItem } from '@/types/floorplan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Armchair, 
  Bed, 
  BookOpen, 
  DoorOpen, 
  Lamp, 
  Sofa,
  Square,
  Table,
  RectangleHorizontal
} from 'lucide-react';

const furnitureItems: FurnitureItem[] = [
  {
    id: 'chair',
    name: 'Chair',
    type: 'chair',
    defaultWidth: 40,
    defaultHeight: 40,
    color: 'hsl(var(--furniture-color))',
    icon: 'Armchair',
  },
  {
    id: 'table',
    name: 'Table',
    type: 'table',
    defaultWidth: 80,
    defaultHeight: 40,
    color: 'hsl(var(--wall-color))',
    icon: 'Table',
  },
  {
    id: 'sofa',
    name: 'Sofa',
    type: 'sofa',
    defaultWidth: 120,
    defaultHeight: 50,
    color: 'hsl(var(--accent))',
    icon: 'Sofa',
  },
  {
    id: 'bed',
    name: 'Bed',
    type: 'bed',
    defaultWidth: 100,
    defaultHeight: 80,
    color: 'hsl(var(--secondary-foreground))',
    icon: 'Bed',
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    type: 'cabinet',
    defaultWidth: 60,
    defaultHeight: 30,
    color: 'hsl(var(--muted-foreground))',
    icon: 'BookOpen',
  },
  {
    id: 'door',
    name: 'Door',
    type: 'door',
    defaultWidth: 20,
    defaultHeight: 60,
    color: 'hsl(var(--wall-color))',
    icon: 'DoorOpen',
  },
  {
    id: 'window',
    name: 'Window',
    type: 'window',
    defaultWidth: 60,
    defaultHeight: 20,
    color: 'hsl(var(--primary))',
    icon: 'RectangleHorizontal',
  },
];

const iconMap = {
  Armchair,
  Table,
  Sofa,
  Bed,
  BookOpen,
  DoorOpen,
  RectangleHorizontal,
  Square,
  Lamp,
};

interface FurnitureItemProps {
  item: FurnitureItem;
}

const DraggableFurnitureItem = ({ item }: FurnitureItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Square;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="hover:shadow-medium transition-all duration-200 hover:scale-105 border-border bg-card">
        <CardContent className="p-3">
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-soft"
              style={{ backgroundColor: item.color }}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-card-foreground text-center">
              {item.name}
            </span>
            <div className="text-xs text-muted-foreground">
              {item.defaultWidth}×{item.defaultHeight}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface FurniturePaletteProps {
  onAddWall: () => void;
  onAddRoom: () => void;
}

export const FurniturePalette = ({ onAddWall, onAddRoom }: FurniturePaletteProps) => {
  return (
    <Card className="w-64 h-full bg-card border-border shadow-medium">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Furniture Palette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic tools */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWall}
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-1" />
              Wall
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRoom}
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-1" />
              Room
            </Button>
          </div>
        </div>

        {/* Draggable furniture */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Drag & Drop Furniture
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {furnitureItems.map((item) => (
              <DraggableFurnitureItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Drag furniture onto the canvas. Use mouse wheel to zoom, click and drag to pan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};