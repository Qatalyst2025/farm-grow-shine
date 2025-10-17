import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SuccessStory {
  id: string;
  farmerName: string;
  location: string;
  cropType: string;
  achievement: string;
  technique: string;
  results: string;
  date: string;
}

const successStories: SuccessStory[] = [
  {
    id: '1',
    farmerName: 'Amina Mwangi',
    location: 'Nairobi Region',
    cropType: 'Tomatoes',
    achievement: 'Increased yield by 60%',
    technique: 'Drip irrigation + companion planting',
    results: 'From 2 tons to 3.2 tons per acre. Revenue increased from $1,200 to $1,920.',
    date: '2024-09-15'
  },
  {
    id: '2',
    farmerName: 'Joseph Osei',
    location: 'Ashanti Region',
    cropType: 'Maize',
    achievement: 'Reduced pest damage by 75%',
    technique: 'Integrated pest management with neem',
    results: 'Saved $300 on pesticides while improving crop health.',
    date: '2024-08-20'
  },
  {
    id: '3',
    farmerName: 'Grace Adebayo',
    location: 'Lagos State',
    cropType: 'Cassava',
    achievement: 'Improved soil fertility',
    technique: 'Cover cropping with legumes',
    results: 'Soil nitrogen increased 40%, reducing fertilizer costs by $200.',
    date: '2024-07-10'
  }
];

export const SuccessStories = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          Success Stories from Farmers Like You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {successStories.map((story) => (
              <Card key={story.id} className="border-l-4 border-l-success">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-success/10 text-success">
                        {story.farmerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg">{story.farmerName}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {story.location}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {story.cropType}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-success/5 p-3 rounded-lg">
                        <p className="font-semibold text-success mb-1">
                          🎉 {story.achievement}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {story.results}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Technique Used:</p>
                        <p className="text-sm text-muted-foreground">{story.technique}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};