import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { MobileHeader } from "../mobile/MobileHeader";

interface Grant {
  id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
}

const grantsList: Grant[] = [
  {
    id: "1",
    title: "Youth Climate Innovation Grant",
    description: "Supports young innovators working on environmental sustainability projects.",
    amount: "Up to KES 150,000",
    deadline: "2025-12-01",
  },
  {
    id: "2",
    title: "AgriTech Women Grant",
    description: "Funding for women building solutions in agriculture and food security.",
    amount: "Up to KES 200,000",
    deadline: "2025-11-28",
  },
  {
    id: "3",
    title: "Eco-Impact Community Grant",
    description: "Community-led sustainability initiatives including cleanups and reforestation.",
    amount: "Up to KES 100,000",
    deadline: "2025-12-15",
  },
];

export default function GrantsPage() {
  const [openGrant, setOpenGrant] = useState<Grant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectName: "",
    projectDescription: "",
    budget: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <MobileHeader />
     <header className="bg-primary text-primary-foreground py-6 shadow-lg">
              <div className="container mx-auto px-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Available Grants</h1>
                    </div>
                  </div>
                </div>
              </div>
            </header>
    
    <div className="min-h-screen bg-background p-6 relative">

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grantsList.map((grant) => (
          <Card
            key={grant.id}
            className="shadow hover:shadow-lg transition rounded-2xl border border-border bg-card"
          >
            <CardHeader>
              <CardTitle className="text-xl">{grant.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">{grant.description}</p>

              <p className="text-sm"><span className="font-semibold">Grant Amount:</span> {grant.amount}</p>
              <p className="text-sm mb-4"><span className="font-semibold">Deadline:</span> {grant.deadline}</p>

              <Button className="w-full" onClick={() => setOpenGrant(grant)}>
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Overlay */}
      {openGrant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <Card className="max-w-lg w-full bg-card border-border shadow-xl relative rounded-2xl">
            <button
              onClick={() => setOpenGrant(null)}
              className="absolute top-4 right-4 text-foreground hover:text-primary"
            >
              <X size={24} />
            </button>

            <CardHeader>
              <CardTitle className="text-2xl">Apply for {openGrant.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Budget (KES)</label>
                <Input
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <Button className="w-full mt-4">Submit Application</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
}
