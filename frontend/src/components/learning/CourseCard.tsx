import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Play, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  modules: number;
  duration: string;
  progress: number;
  enrolled: boolean;
  icon: string;
  color: string;
}

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case "Beginner": return "bg-success/10 text-success border-success/20";
      case "Intermediate": return "bg-warning/10 text-warning border-warning/20";
      case "Advanced": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getColorClass = (color: string) => {
    switch(color) {
      case "success": return "border-l-success";
      case "primary": return "border-l-primary";
      case "secondary": return "border-l-secondary";
      case "warning": return "border-l-warning";
      default: return "border-l-primary";
    }
  };

  return (
    <Card className={`p-6 border-l-4 ${getColorClass(course.color)} hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{course.icon}</div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-card-foreground">{course.title}</h3>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className={getLevelColor(course.level)}>
          {course.level}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{course.modules} modules</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{course.duration}</span>
        </div>
      </div>

      {course.enrolled && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-2">
        {course.enrolled ? (
          <>
            <Link to={`/farmer/learn/course/${course.id}`} className="flex-1">
              <Button className="w-full">
                {course.progress === 100 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Review Course
                  </>
                ) : course.progress > 0 ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Course
                  </>
                )}
              </Button>
            </Link>
            {course.progress === 100 && (
              <Button variant="outline">
                Download Certificate
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Enroll Now
          </Button>
        )}
      </div>

      {course.progress === 100 && (
        <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-sm text-success font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Course completed! You earned 200 points
          </p>
        </div>
      )}
    </Card>
  );
};
