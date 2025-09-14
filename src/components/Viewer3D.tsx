import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Plane } from '@react-three/drei';
import { FloorPlanElement } from '@/types/floorplan';

interface Viewer3DProps {
  elements: FloorPlanElement[];
  width: number;
  height: number;
}

const FloorPlanElement3D = ({ element }: { element: FloorPlanElement }) => {
  // Convert 2D coordinates to 3D (scale down for better viewing)
  const scale = 0.01;
  const x = (element.x - 400) * scale; // Center around origin
  const z = (element.y - 300) * scale; // Center around origin
  const width = element.width * scale;
  const depth = element.height * scale;

  // Different heights and colors for different types
  const getElementProps = () => {
    switch (element.type) {
      case 'wall':
        return {
          height: 3,
          color: '#8B9DC3',
          position: [x, 1.5, z] as [number, number, number],
        };
      case 'furniture':
        return {
          height: element.name?.includes('Table') ? 0.8 : 
                element.name?.includes('Chair') ? 1.2 :
                element.name?.includes('Bed') ? 0.6 :
                element.name?.includes('Sofa') ? 1.0 : 0.8,
          color: element.color?.includes('hsl') ? '#F59E0B' : element.color || '#F59E0B',
          position: [x, 0.4, z] as [number, number, number],
        };
      case 'room':
        return null; // Rooms are just outlines, not 3D objects
      default:
        return {
          height: 0.5,
          color: '#6B7280',
          position: [x, 0.25, z] as [number, number, number],
        };
    }
  };

  const props = getElementProps();
  if (!props) return null;

  return (
    <Box
      position={props.position}
      args={[width, props.height, depth]}
    >
      <meshLambertMaterial color={props.color} />
    </Box>
  );
};

export const Viewer3D = ({ elements, width, height }: Viewer3DProps) => {
  return (
    <div className="w-full h-full bg-viewer-bg rounded-lg overflow-hidden border border-border">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.3}
        />

        {/* Floor */}
        <Plane
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          args={[20, 20]}
        >
          <meshLambertMaterial color="hsl(var(--floor-color))" />
        </Plane>

        {/* Grid for reference */}
        <Grid
          position={[0, 0.01, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6B7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4B5563"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        {/* Render 3D elements */}
        {elements.map((element) => (
          <FloorPlanElement3D key={element.id} element={element} />
        ))}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* 3D Viewer UI */}
      <div className="absolute top-4 left-4 text-white">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <h3 className="text-sm font-medium">3D Preview</h3>
          <p className="text-xs opacity-75">
            {elements.length} elements • Drag to rotate
          </p>
        </div>
      </div>
    </div>
  );
};