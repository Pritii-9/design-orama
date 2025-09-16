import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { floorPlanAPI } from '@/lib/api';
import { Upload, FileImage, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadPlanProps {
  onImageUploaded: (imageUrl: string | null) => void;
}

export const UploadPlan = ({ onImageUploaded }: UploadPlanProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG, etc.).',
        variant: 'destructive',
      });
      return;
    }

    // Create local URL for immediate preview
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    onImageUploaded(imageUrl);
    
    toast({
      title: 'Image loaded',
      description: 'Your floor plan image has been loaded as background.',
    });
  }, [onImageUploaded, toast]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image or PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // For immediate use, create local URL
      handleFileSelect(file);
      
      // Optionally upload to server for persistence
      const response = await floorPlanAPI.uploadImage(file);
      if (response.success && response.imageUrl) {
        // Could update to server URL if needed
        // onImageUploaded(response.imageUrl);
      }
    } catch (error) {
      // Local file still works even if server upload fails
      console.warn('Server upload failed, using local file:', error);
    } finally {
      setUploading(false);
    }
  }, [handleFileSelect, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileUpload]);

  const handleClearImage = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    onImageUploaded(null);
    toast({
      title: 'Background cleared',
      description: 'Floor plan background has been removed.',
    });
  }, [uploadedImage, onImageUploaded, toast]);

  return (
    <Card className="w-full border-border bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Background Image
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {uploadedImage ? (
          <div className="space-y-3">
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
              <img 
                src={uploadedImage} 
                alt="Floor plan background" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-1" />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileImage className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-card-foreground mb-1">
              Upload Floor Plan
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Drag & drop or click to upload
            </p>
            
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploading ? 'Loading...' : 'Choose Image'}
            </Button>
          </div>
        )}
        
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};