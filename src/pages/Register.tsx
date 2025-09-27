import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "../lib/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff" as "admin" | "manager" | "staff",
  });

  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isConfigured } = useAuth();

  // Redirect logic
  useEffect(() => {
    if (!isConfigured()) {
      navigate("/login");
    } else if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate, isConfigured]);

  // SEO meta setup
  useEffect(() => {
    document.title = "Register - Inventory Management System";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "Create a new account for the Inventory Management System";
    if (meta) {
      meta.setAttribute("content", desc);
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  const handleChange = (
    field: "name" | "email" | "password" | "confirmPassword" | "role",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      return showError("Name required", "Please enter your full name");
    }

    if (!email.trim()) {
      return showError("Email required", "Please enter your email address");
    }

    if (password.length < 6) {
      return showError(
        "Password too short",
        "Password must be at least 6 characters long"
      );
    }

    if (password !== confirmPassword) {
      return showError(
        "Passwords don't match",
        "Please make sure both passwords are the same"
      );
    }

    return true;
  };

  const showError = (title: string, description: string) => {
    toast({ title, description, variant: "destructive" });
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.role
      );

      toast({
        title: "Registration successful!",
        description: "Your account has been created. You can now log in.",
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordField = ({
    id,
    label,
    value,
    field,
    placeholder,
  }: {
    id: string;
    label: string;
    value: string;
    field: "password" | "confirmPassword";
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={passwordVisible[field] ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() =>
            setPasswordVisible((prev) => ({
              ...prev,
              [field]: !prev[field],
            }))
          }
        >
          {passwordVisible[field] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-enterprise-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Create Account
              </CardTitle>
              <CardDescription>
                Join the Inventory Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "manager" | "staff") =>
                    handleChange("role", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Staff: View only • Manager: Create/Edit • Admin: Full access
                </p>
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                field="password"
                placeholder="Enter your password"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                field="confirmPassword"
                placeholder="Confirm your password"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
