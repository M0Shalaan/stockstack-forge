import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Eye, EyeOff, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { apiConfig } from "@/lib/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [baseUrl, setBaseUrl] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, user, isConfigured } = useAuth()

  useEffect(() => {
    // Check if API is configured
    if (!isConfigured()) {
      setShowSetup(true);
      const config = apiConfig.get();
      setBaseUrl(config.baseUrl || "");
    }
    
    // Redirect if already logged in
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate, isConfigured]);

  const handleSetup = () => {
    if (!baseUrl.trim()) {
      toast({
        title: "Base URL required",
        description: "Please enter your API base URL",
        variant: "destructive",
      });
      return;
    }
    
    apiConfig.setBaseUrl(baseUrl.trim());
    setShowSetup(false);
    toast({
      title: "API configured",
      description: "You can now log in to your system",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured()) {
      toast({
        title: "Setup required",
        description: "Please configure your API URL first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (error) {
      // Error handling is done in the login function
    } finally {
      setIsLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-secondary p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-enterprise-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Setup Required</CardTitle>
                <CardDescription>
                  Configure your MongoDB API connection
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">API Base URL</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://your-api.com/api"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  required
                />
              </div>
              <Button onClick={handleSetup} className="w-full">
                Continue to Login
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>Enter the base URL of your deployed MongoDB API backend.</p>
                <p className="mt-2">Example: https://your-api.herokuapp.com/api</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-enterprise-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Inventory Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSetup(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                API Settings
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need to register? Contact your system administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}