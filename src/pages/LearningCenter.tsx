import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Video, 
  MessageCircle, 
  Award, 
  ArrowLeft, 
  Search,
  Play,
  Download,
  Bookmark,
  Trophy,
  Star,
  Target
} from "lucide-react";
import { CourseCard } from "@/components/learning/CourseCard";
import { VideoLibrary } from "@/components/learning/VideoLibrary";
import { KnowledgeBase } from "@/components/learning/KnowledgeBase";
import { AchievementSystem } from "@/components/learning/AchievementSystem";

const LearningCenter = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock user progress data
  const userProgress = {
    totalPoints: 850,
    coursesCompleted: 3,
    videosWatched: 12,
    quizzesPassed: 8,
    rank: "Advanced Learner"
  };

  // Learning pathways
  const courses = [
    {
      id: 1,
      title: "First Time Farmer",
      description: "Complete guide to starting your farming journey with confidence",
      level: "Beginner",
      modules: 8,
      duration: "2 hours",
      progress: 75,
      enrolled: true,
      icon: "🌱",
      color: "success"
    },
    {
      id: 2,
      title: "Financial Literacy",
      description: "Master money management, loans, and building financial health",
      level: "Beginner",
      modules: 6,
      duration: "1.5 hours",
      progress: 100,
      enrolled: true,
      icon: "💰",
      color: "primary"
    },
    {
      id: 3,
      title: "Advanced Farming Techniques",
      description: "Boost your yields with modern farming methods and technology",
      level: "Advanced",
      modules: 12,
      duration: "4 hours",
      progress: 30,
      enrolled: true,
      icon: "🚜",
      color: "secondary"
    },
    {
      id: 4,
      title: "Marketplace Mastery",
      description: "Learn to sell effectively, negotiate deals, and build buyer relationships",
      level: "Intermediate",
      modules: 10,
      duration: "3 hours",
      progress: 0,
      enrolled: false,
      icon: "🏪",
      color: "warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/farmer">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-1">Learning Center</h1>
                <p className="text-primary-foreground/90">
                  Grow your knowledge, grow your success
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold">{userProgress.totalPoints}</div>
                <div className="text-sm text-primary-foreground/80">Total Points</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-l-4 border-l-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Courses Completed</p>
                <p className="text-2xl font-bold text-card-foreground">{userProgress.coursesCompleted}</p>
              </div>
              <BookOpen className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Videos Watched</p>
                <p className="text-2xl font-bold text-card-foreground">{userProgress.videosWatched}</p>
              </div>
              <Video className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quizzes Passed</p>
                <p className="text-2xl font-bold text-card-foreground">{userProgress.quizzesPassed}</p>
              </div>
              <Target className="h-8 w-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                <p className="text-lg font-bold text-card-foreground">{userProgress.rank}</p>
              </div>
              <Star className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for courses, videos, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <MessageCircle className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Learning Pathways</h2>
              <p className="text-muted-foreground">
                Choose a course to start your journey or continue where you left off
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <VideoLibrary searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <KnowledgeBase searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementSystem userProgress={userProgress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningCenter;
