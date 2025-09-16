import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Canvas2D } from '@/components/Canvas2D';
import { FurniturePalette } from '@/components/FurniturePalette';
import { Viewer3D } from '@/components/Viewer3D';
import { UploadPlan } from '@/components/UploadPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { floorPlanAPI } from '@/lib/api';
import { FloorPlan, FloorPlanElement, FurnitureItem } from '@/types/floorplan';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Grid3X3,
  Eye,
  Home,
  Settings,
  Maximize
} from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function EditorPage() {
  // Floor plan state
  const [floorPlan, setFloorPlan] = useState<FloorPlan>({
    name: 'Untitled Floor Plan',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    elements: [],
  });

  // UI state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('2d');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Generate unique ID
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new element
  const addElement = useCallback((element: Omit<FloorPlanElement, 'id'>) => {
    const newElement: FloorPlanElement = {
      ...element,
      id: generateId(),
    };
    
    setFloorPlan(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    
    setSelectedElementId(newElement.id);
  }, []);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<FloorPlanElement>) => {
    setFloorPlan(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  }, []);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setFloorPlan(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
    }));
    setSelectedElementId(null);
  }, []);

  // Handle drag end from furniture palette
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || over.id !== 'canvas') return;
    
    const furnitureData = active.data.current as FurnitureItem;
    if (!furnitureData) return;

    // Get drop position relative to canvas
    const canvasRect = document.querySelector('[data-id="canvas"]')?.getBoundingClientRect();
    const dropX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : 0;
    const dropY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : 0;
    
    let x = 100; // Default position
    let y = 100;
    
    if (canvasRect && dropX && dropY) {
      x = Math.max(0, Math.min(dropX - canvasRect.left - furnitureData.defaultWidth / 2, CANVAS_WIDTH - furnitureData.defaultWidth));
      y = Math.max(0, Math.min(dropY - canvasRect.top - furnitureData.defaultHeight / 2, CANVAS_HEIGHT - furnitureData.defaultHeight));
    }

    addElement({
      type: 'furniture',
      x,
      y,
      width: furnitureData.defaultWidth,
      height: furnitureData.defaultHeight,
      color: furnitureData.color,
      name: furnitureData.name,
    });

    toast({
      title: 'Furniture added',
      description: `${furnitureData.name} has been added to your floor plan.`,
    });
  }, [addElement, toast]);

  // Add wall
  const addWall = useCallback(() => {
    addElement({
      type: 'wall',
      x: 100,
      y: 100,
      width: 200,
      height: 20,
    });
  }, [addElement]);

  // Add room
  const addRoom = useCallback(() => {
    addElement({
      type: 'room',
      x: 50,
      y: 50,
      width: 300,
      height: 200,
    });
  }, [addElement]);

  // Save floor plan
  const saveFloorPlan = useCallback(async () => {
    setSaving(true);
    try {
      const response = await floorPlanAPI.savePlan(floorPlan);
      if (response.success && response.data) {
        setFloorPlan(response.data);
        toast({
          title: 'Floor plan saved',
          description: 'Your floor plan has been saved successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save your floor plan.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [floorPlan, toast]);

  // Selected element for property panel
  const selectedElement = floorPlan.elements.find(el => el.id === selectedElementId);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-card-foreground">FloorPlan Editor</h1>
          </div>
          <div className="w-px h-6 bg-border" />
          <Input
            value={floorPlan.name}
            onChange={(e) => setFloorPlan(prev => ({ ...prev, name: e.target.value }))}
            className="w-64"
            placeholder="Floor plan name"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveFloorPlan}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Furniture palette */}
          <div className="w-64 border-r border-border bg-card shadow-soft flex flex-col">
            <FurniturePalette onAddWall={addWall} onAddRoom={addRoom} />
            
            <div className="p-4 border-t border-border">
              <UploadPlan onImageUploaded={setBackgroundImage} />
            </div>
          </div>

          {/* Center - Canvas and 3D viewer */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-border bg-card px-4">
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="2d" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    2D Editor
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    3D Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="2d" className="flex-1 p-4 m-0">
                <Canvas2D
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  elements={floorPlan.elements}
                  selectedId={selectedElementId}
                  backgroundImage={backgroundImage}
                  showGrid={showGrid}
                  onElementSelect={setSelectedElementId}
                  onElementUpdate={updateElement}
                  onElementAdd={addElement}
                />
              </TabsContent>

              <TabsContent value="3d" className="flex-1 p-4 m-0">
                <Viewer3D
                  elements={floorPlan.elements}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar - Properties */}
          <div className="w-64 border-l border-border bg-card shadow-soft overflow-y-auto">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedElement ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <Input
                        value={selectedElement.name || ''}
                        onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                        placeholder="Element name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">X</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.x)}
                          onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Y</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.y)}
                          onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Width</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.width)}
                          onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 1 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Height</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.height)}
                          onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 1 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteElement(selectedElement.id)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Element
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select an element to edit its properties
                    </p>
                  </div>
                )}

                {/* Floor plan stats */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Floor Plan Stats</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Elements:</span>
                      <span>{floorPlan.elements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Walls:</span>
                      <span>{floorPlan.elements.filter(el => el.type === 'wall').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Furniture:</span>
                      <span>{floorPlan.elements.filter(el => el.type === 'furniture').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{floorPlan.elements.filter(el => el.type === 'room').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DragOverlay>
          {/* Drag overlay content if needed */}
        </DragOverlay>
      </DndContext>
    </div>
  );
}