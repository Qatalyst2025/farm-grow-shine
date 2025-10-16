import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail, MapPin, Award, Wrench, Calendar, MessageCircle, Users } from "lucide-react";
import { useState } from "react";

export const MemberDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const members = [
    {
      id: 1,
      name: "Kwame Mensah",
      role: "Cooperative Leader",
      phone: "+233 24 123 4567",
      email: "kwame@example.com",
      location: "Kumasi, Ashanti",
      specialization: "Maize & Cassava",
      equipment: ["Tractor", "Irrigation System"],
      performance: 95,
      joinedDate: "2023-05-15",
      avatar: "👨‍🌾"
    },
    {
      id: 2,
      name: "Ama Boateng",
      role: "Finance Manager",
      phone: "+233 24 234 5678",
      email: "ama@example.com",
      location: "Kumasi, Ashanti",
      specialization: "Financial Planning",
      equipment: ["Storage Facility"],
      performance: 92,
      joinedDate: "2023-05-20",
      avatar: "👩‍🌾"
    },
    {
      id: 3,
      name: "Joseph Osei",
      role: "Resource Coordinator",
      phone: "+233 24 345 6789",
      email: "joseph@example.com",
      location: "Ejisu, Ashanti",
      specialization: "Rice Farming",
      equipment: ["Harvester", "Seed Drill"],
      performance: 88,
      joinedDate: "2023-06-10",
      avatar: "👨‍🌾"
    },
    {
      id: 4,
      name: "Akosua Frimpong",
      role: "Member",
      phone: "+233 24 456 7890",
      email: "akosua@example.com",
      location: "Bekwai, Ashanti",
      specialization: "Vegetables & Fruits",
      equipment: ["Greenhouse"],
      performance: 90,
      joinedDate: "2023-07-01",
      avatar: "👩‍🌾"
    }
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-primary";
    return "text-warning";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Member Directory</h2>
          <p className="text-muted-foreground">
            Connect with {members.length} cooperative members
          </p>
        </div>
        <Button>
          <Award className="h-4 w-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, role, or specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{member.avatar}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-card-foreground">{member.name}</h3>
                    <Badge variant="outline" className="mt-1">{member.role}</Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPerformanceColor(member.performance)}`}>
                      {member.performance}%
                    </div>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{member.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
            </div>

            <div className="space-y-3 pb-4 border-b border-border">
              <div>
                <p className="text-sm font-medium text-card-foreground mb-1">Specialization</p>
                <Badge variant="secondary">{member.specialization}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {member.equipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      <Wrench className="h-3 w-3" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button size="sm">View Profile</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No members found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </Card>
      )}
    </div>
  );
};
