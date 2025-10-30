import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, Clock, Eye, Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoLibraryProps {
  searchQuery: string;
}

export const VideoLibrary = ({ searchQuery }: VideoLibraryProps) => {
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState("all");
  const [bookmarkedVideos, setBookmarkedVideos] = useState<number[]>([]);

  const videos = [
    {
      id: 1,
      title: "Understanding Your First Loan",
      category: "Financial Literacy",
      duration: "3:45",
      views: 1250,
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
      description: "Learn the basics of agricultural loans and how to apply successfully",
      featured: true
    },
    {
      id: 2,
      title: "Soil Preparation Techniques",
      category: "Farming Basics",
      duration: "5:20",
      views: 980,
      thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
      description: "Step-by-step guide to preparing your soil for optimal crop growth",
      featured: false
    },
    {
      id: 3,
      title: "Success Story: From $100 to $10,000",
      category: "Success Stories",
      duration: "8:15",
      views: 2340,
      thumbnail: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
      description: "Meet Amina, who grew her farming income 100x in 2 years",
      featured: true
    },
    {
      id: 4,
      title: "Marketplace Negotiation Tips",
      category: "Marketplace",
      duration: "4:30",
      views: 760,
      thumbnail: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400",
      description: "Master the art of getting the best price for your crops",
      featured: false
    },
    {
      id: 5,
      title: "Pest Management Without Chemicals",
      category: "Advanced Techniques",
      duration: "6:10",
      views: 1120,
      thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
      description: "Organic pest control methods that protect your crops naturally",
      featured: false
    },
    {
      id: 6,
      title: "Building Your Financial Score",
      category: "Financial Literacy",
      duration: "4:05",
      views: 890,
      thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
      description: "Simple steps to improve your creditworthiness and unlock better loans",
      featured: false
    }
  ];

  const categories = ["all", "Financial Literacy", "Farming Basics", "Success Stories", "Marketplace", "Advanced Techniques"];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (videoId: number) => {
    if (bookmarkedVideos.includes(videoId)) {
      setBookmarkedVideos(bookmarkedVideos.filter(id => id !== videoId));
      toast({
        title: "Bookmark removed",
        description: "Video removed from your saved list",
      });
    } else {
      setBookmarkedVideos([...bookmarkedVideos, videoId]);
      toast({
        title: "Video bookmarked",
        description: "Video saved to your learning library",
      });
    }
  };

  const handleDownload = (videoTitle: string) => {
    toast({
      title: "Download started",
      description: `"${videoTitle}" will be available offline soon`,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Video Library</h2>
          <p className="text-muted-foreground">
            Short, actionable lessons you can watch anytime
          </p>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all group">
            <div className="relative aspect-video bg-muted">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="lg" className="rounded-full">
                  <Play className="h-6 w-6 mr-2" />
                  Watch Now
                </Button>
              </div>
              {video.featured && (
                <Badge className="absolute top-2 left-2 bg-warning text-white">
                  Featured
                </Badge>
              )}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}
              </div>
            </div>

            <div className="p-4">
              <Badge variant="outline" className="mb-2 text-xs">
                {video.category}
              </Badge>
              <h3 className="font-semibold mb-2 text-card-foreground line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Play className="h-3 w-3 mr-1" />
                  Play
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownload(video.title)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleBookmark(video.id)}
                >
                  {bookmarkedVideos.includes(video.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <Card className="p-12 text-center">
          <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No videos found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      )}
    </div>
  );
};
