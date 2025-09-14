import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Grid3X3, 
  Eye, 
  Upload, 
  Save,
  ArrowRight,
  Building,
  Ruler,
  Palette
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-canvas">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">FloorPlan App</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional 2D floor plans with drag-and-drop furniture and preview them in 3D. 
            Perfect for architects, designers, and homeowners.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-large transition-all duration-300 cursor-pointer border-border bg-card" 
                onClick={() => navigate('/editor')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Grid3X3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-card-foreground">2D Floor Plan Editor</CardTitle>
              <CardDescription>
                Create detailed floor plans with walls, rooms, and furniture using our intuitive drag-and-drop interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium">
                Start Creating <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl text-card-foreground">3D Preview</CardTitle>
              <CardDescription>
                Visualize your floor plans in stunning 3D with realistic lighting and materials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground">
                Interactive 3D visualization
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-furniture/10 flex items-center justify-center mb-4 group-hover:bg-furniture/20 transition-colors">
                <Upload className="w-6 h-6 text-furniture" />
              </div>
              <CardTitle className="text-xl text-card-foreground">Import & Export</CardTitle>
              <CardDescription>
                Upload existing floor plan images as backgrounds and export your creations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground">
                Multiple file formats supported
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Professional Tools</h3>
              <p className="text-muted-foreground">
                Walls, rooms, doors, windows, and a complete furniture library.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Ruler className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Precise Measurements</h3>
              <p className="text-muted-foreground">
                Accurate dimensions with grid snapping and measurement tools.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-furniture/10 flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-furniture" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Custom Styling</h3>
              <p className="text-muted-foreground">
                Customize colors, materials, and properties for every element.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/editor')}
            className="bg-gradient-primary hover:opacity-90 text-white shadow-glow"
          >
            <Grid3X3 className="w-5 h-5 mr-2" />
            Launch Floor Plan Editor
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No account required • Start creating immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
