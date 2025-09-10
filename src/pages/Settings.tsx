import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api, apiConfig } from "@/lib/api";
import { CheckCircle2, Link as LinkIcon, Shield, Wifi } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const cfg = apiConfig.get();

  const [baseUrl, setBaseUrl] = useState(cfg.baseUrl || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tokenPreview, setTokenPreview] = useState<string | undefined>(cfg.token);

  // Basic SEO
  useEffect(() => {
    document.title = "Settings - External API | IMS";
    const desc = document.querySelector('meta[name="description"]');
    const content = "Configure the external MongoDB API base URL and authentication.";
    if (desc) {
      desc.setAttribute("content", content);
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.href;
    if (canonical) canonical.href = href;
    else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = href;
      document.head.appendChild(l);
    }
  }, []);

  const saveBaseUrl = () => {
    if (!baseUrl) {
      toast({ title: "Base URL required", description: "Please enter your API base URL.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      apiConfig.setBaseUrl(baseUrl.trim());
      toast({ title: "Saved", description: "API base URL has been saved." });
    } finally {
      setIsSaving(false);
    }
  };

  const ping = async () => {
    if (!baseUrl) {
      toast({ title: "Missing base URL", description: "Save your API base URL first.", variant: "destructive" });
      return;
    }
    setIsPinging(true);
    try {
      const res = await api.health();
      toast({ title: "API reachable", description: res?.ok ? "Health OK" : "Unexpected response" });
    } catch (e: any) {
      toast({ title: "Health check failed", description: e?.message || "Could not reach API", variant: "destructive" });
    } finally {
      setIsPinging(false);
    }
  };

  const doLogin = async () => {
    if (!baseUrl) {
      toast({ title: "Missing base URL", description: "Save your API base URL first.", variant: "destructive" });
      return;
    }
    if (!email || !password) {
      toast({ title: "Email and password required", description: "Enter credentials to obtain a token.", variant: "destructive" });
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await api.login(email, password);
      apiConfig.setToken(res.token);
      setTokenPreview(res.token);
      toast({ title: "Login successful", description: `Welcome ${res.user.name}` });
    } catch (e: any) {
      toast({ title: "Login failed", description: e?.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const clearToken = () => {
    apiConfig.setToken(undefined);
    setTokenPreview(undefined);
    toast({ title: "Token cleared", description: "Authorization token removed." });
  };

  const maskedToken = tokenPreview ? tokenPreview.slice(0, 8) + "…" + tokenPreview.slice(-6) : "No token saved";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your external MongoDB API connection</p>
      </div>

      {/* API Base URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" /> API Base URL
          </CardTitle>
          <CardDescription>Enter the full base URL of your deployed API (e.g. https://api.example.com/api)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input id="baseUrl" placeholder="https://your-api.com/api" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveBaseUrl} disabled={isSaving}>Save</Button>
            <Button variant="outline" onClick={ping} disabled={isPinging}>
              <Wifi className="h-4 w-4 mr-2" /> Test health
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Authentication
          </CardTitle>
          <CardDescription>Obtain and store a JWT token using your API's /auth/login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={doLogin} disabled={isLoggingIn}>Log in & save token</Button>
            <Button variant="outline" onClick={clearToken}>Clear token</Button>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" /> Token: {maskedToken}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Ensure your backend CORS allows this app's origin. Default endpoints: /health, /auth/login, /products, /warehouses, /categories, /parties, /transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Enter your API base URL and click Test health. You can change it anytime.</li>
            <li>Use your credentials to obtain a JWT. It will be sent in the Authorization header.</li>
            <li>You can wire pages to the API using helpers exported from lib/api.ts.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
