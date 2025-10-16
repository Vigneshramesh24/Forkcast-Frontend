import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

interface SavedGraph {
  id: string;
  name: string;
  imageData: string;
  savedAt: Date;
}

const SavedInformation = () => {
  // This will be populated from localStorage or a database
  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>(() => {
    const saved = localStorage.getItem("savedGraphs");
    return saved ? JSON.parse(saved) : [];
  });

  const handleDownload = (graph: SavedGraph) => {
    const link = document.createElement("a");
    link.href = graph.imageData;
    link.download = `${graph.name}-${new Date(graph.savedAt).toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    const updated = savedGraphs.filter((graph) => graph.id !== id);
    setSavedGraphs(updated);
    localStorage.setItem("savedGraphs", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-[56px] px-10 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Saved Information</h1>
          
          {savedGraphs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No saved graphs yet. Save graphs from the analytics panel to view them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedGraphs.map((graph) => (
                <Card key={graph.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{graph.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Saved on {new Date(graph.savedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={graph.imageData} 
                      alt={graph.name}
                      className="w-full h-auto rounded-lg mb-4"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(graph)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleDelete(graph.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedInformation;
