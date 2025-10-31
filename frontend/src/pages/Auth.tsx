import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Sprout, ShoppingBag } from "lucide-react";

const API_BASE = import.meta.env.VITE_APP_API_BASE || "http://localhost:3000";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer">("farmer");

  const redirectByRole = (role: string) => {
    const normalized = role.toLowerCase();
    switch (normalized) {
      case "farmer":
        navigate("/farmer");
        break;
      case "buyer":
        navigate("/marketplace");
        break;
      default:
        navigate("/");
    }
  };

  const saveAuthData = (data: any) => {
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data?.user?.role) {
      localStorage.setItem("user_role", data.user.role);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          role: selectedRole 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to sign up");

      saveAuthData(data);
      toast.success("Account created successfully");
      redirectByRole(data.user.role);
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      // If login fails, throw error
      if (!res.ok) {
        throw new Error(data?.message || "Failed to sign in");
      }

      // Extract token and user safely
      const token = data?.access_token || data?.token;
      const user = data?.user || data?.data?.user;

      if (!token || !user || !user.role) {
        throw new Error("Invalid login response");
      }

      // Save token and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_role", user.role.toUpperCase());

      toast.success("Signed in successfully!");

      // Redirect based on role
      const role = user.role.toUpperCase();
      switch (role) {
        case "FARMER":
          navigate("/farmer");
          break;
        case "BUYER":
          navigate("/marketplace");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome to AgriLinka</h1>
          <p className="text-muted-foreground">AI-powered agricultural finance platform</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="farmer@agrilinka.com"
                />
              </div>

              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Farmer"
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="farmer@agrilinka.com"
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
              </div>

              {/* Role Selection Section - Fixed */}
              <div className="space-y-3">
                <Label>I am a:</Label>
                <RadioGroup 
                  value={selectedRole} 
                  onValueChange={(value: "farmer" | "buyer") => setSelectedRole(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmer" id="role-farmer" />
                    <Label 
                      htmlFor="role-farmer" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full"
                    >
                      <div className="flex flex-col items-center">
                        <Sprout className="mb-2 h-6 w-6" />
                        <span className="font-semibold">Farmer</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Grow crops & get financing
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="role-buyer" />
                    <Label 
                      htmlFor="role-buyer" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full"
                    >
                      <div className="flex flex-col items-center">
                        <ShoppingBag className="mb-2 h-6 w-6" />
                        <span className="font-semibold">Buyer</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Purchase quality crops
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
