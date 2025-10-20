import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, TrendingUp, MapPin, ArrowRight, Heart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SuccessStory {
  id: string;
  name: string;
  age: number;
  location: string;
  achievement: string;
  story: string;
  revenue: string;
  technology: string;
  image?: string;
  likes: number;
}

export default function YouthSuccessStories() {
  const [stories] = useState<SuccessStory[]>([
    {
      id: '1',
      name: 'Amara Okonkwo',
      age: 24,
      location: 'Lagos, Nigeria',
      achievement: 'From Student to Agripreneur',
      story: 'Started with 1 acre of tomatoes using smart irrigation. Now supplying 50+ restaurants across Lagos with fresh produce.',
      revenue: '₦2.5M monthly',
      technology: 'Drip Irrigation + Market App',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      likes: 342,
    },
    {
      id: '2',
      name: 'David Kimani',
      age: 22,
      location: 'Nairobi, Kenya',
      achievement: 'Tech-Enabled Dairy Farmer',
      story: 'Using AI to monitor cow health and optimize milk production. Increased output by 40% in 6 months.',
      revenue: 'KSh 180K monthly',
      technology: 'IoT Sensors + AI Analytics',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      likes: 289,
    },
    {
      id: '3',
      name: 'Fatima Hassan',
      age: 26,
      location: 'Kano, Nigeria',
      achievement: 'Organic Farming Pioneer',
      story: 'Built a thriving organic vegetable farm, exporting to Dubai. Employing 15 other young people in the community.',
      revenue: '₦4M monthly',
      technology: 'Greenhouse Tech + Export Platform',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      likes: 421,
    },
    {
      id: '4',
      name: 'Joseph Mwangi',
      age: 23,
      location: 'Eldoret, Kenya',
      achievement: 'Poultry Automation Expert',
      story: 'Automated chicken farm with smart feeding and climate control. Scaling to 10,000 birds this year.',
      revenue: 'KSh 250K monthly',
      technology: 'Automated Systems + Mobile Monitoring',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      likes: 267,
    },
  ]);

  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const handleLike = (storyId: string) => {
    setLikedStories(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(storyId)) {
        newLiked.delete(storyId);
      } else {
        newLiked.add(storyId);
      }
      return newLiked;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Youth Success Stories
          </h3>
          <p className="text-xs text-muted-foreground">Real farmers, real results</p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20">
          <TrendingUp className="h-3 w-3 mr-1" />
          Inspiring
        </Badge>
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {stories.map((story) => (
            <CarouselItem key={story.id}>
              <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                  {story.image && (
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={story.image} />
                        <AvatarFallback>{story.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-white">
                        <p className="font-bold text-sm">{story.name}, {story.age}</p>
                        <p className="text-xs flex items-center gap-1 opacity-90">
                          <MapPin className="h-3 w-3" />
                          {story.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <Badge className="mb-2 bg-gradient-to-r from-primary to-secondary">
                      {story.achievement}
                    </Badge>
                    <p className="text-sm leading-relaxed">{story.story}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-y">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-bold text-sm text-emerald-600">{story.revenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Technology</p>
                      <p className="font-semibold text-xs">{story.technology}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(story.id)}
                      className="gap-2"
                    >
                      <Heart 
                        className={`h-4 w-4 ${likedStories.has(story.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                      <span className="text-xs">{story.likes + (likedStories.has(story.id) ? 1 : 0)}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      Read Full Story
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
