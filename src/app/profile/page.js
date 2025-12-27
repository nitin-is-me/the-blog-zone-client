"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, LogOut, Eye, EyeOff, Loader2, User, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // i'm keeping this for local state but toast is better
  const [activeTab, setActiveTab] = useState("personal");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      let token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(response.data);
        setFormData({
          name: response.data.name || "",
          username: response.data.username || "",
          newUsername: response.data.username || "",
          newPassword: "",
          confirmPassword: "",
          currentPassword: ""
        });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toast.error("Failed to load user information.");

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    setLogoutLoading(true);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUsernameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (/\s/.test(value)) {
      setUsernameError("Spaces are not allowed in username");
    } else {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    // We need to use the new value for the field being changed
    // and the current state for the other field to compare effectively
    // but setFormData is async so we use local variables for validation

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (/\s/.test(value)) {
      setPasswordError("Spaces are not allowed in password");
      return;
    }

    let currentNewPassword = formData.newPassword;
    let currentConfirmPassword = formData.confirmPassword;

    if (name === "newPassword") {
      currentNewPassword = value;
    } else if (name === "confirmPassword") {
      currentConfirmPassword = value;
    }

    // Only validate matching if both fields have some content or if we are typing in the second field
    if (currentNewPassword && currentConfirmPassword) {
      if (currentNewPassword !== currentConfirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    if (/\s/.test(formData.newUsername)) {
      setError("Username cannot contain spaces");
      toast.error("Username cannot contain spaces");
      setUpdating(false);
      return;
    }

    let token = localStorage.getItem("token");
    try {
      const trimmedName = formData.name.trim();
      const payload = {
        name: trimmedName
      };

      if (formData.newUsername !== formData.username) {
        payload.newUsername = formData.newUsername;
      }

      const response = await axios.put(
        "https://the-blog-zone-server.vercel.app/api/auth/updateProfile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      const updatedUser = {
        ...currentUser,
        name: trimmedName,
      };

      if (formData.newUsername !== formData.username) {
        updatedUser.username = formData.newUsername;
      }

      setCurrentUser(updatedUser);

      setFormData(prev => ({
        ...prev,
        name: trimmedName,
        username: updatedUser.username,
        newUsername: updatedUser.username
      }));

      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");

    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMsg = error.response?.data?.message || "Failed to update profile. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      toast.error("New passwords do not match");
      return;
    }

    if (/\s/.test(formData.newPassword)) {
      setError("Password cannot contain spaces");
      toast.error("Password cannot contain spaces");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "https://the-blog-zone-server.vercel.app/api/auth/changePassword",
        {
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess("Password updated successfully!");
      toast.success("Password updated successfully!");
      setFormData(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      console.error("Failed to update password:", error);
      const errorMsg = error.response?.data?.message || "Failed to update password. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-8 flex flex-col items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="gap-2"
            >
              {logoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
        {/* User Profile Banner */}
        <Card className="border-none shadow-md bg-card/50">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
              <p className="text-muted-foreground">@{currentUser?.username}</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2">
                Joined {formatTimeAgo(currentUser.createdAt).split(",")[0].trim()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" /> Personal
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your public profile display name and username.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form id="personal-form" onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newUsername">Username</Label>
                    <Input
                      id="newUsername"
                      name="newUsername"
                      value={formData.newUsername}
                      onChange={handleUsernameChange}
                      placeholder="username"
                      required
                      className={usernameError ? "border-destructive" : ""}
                    />
                    {usernameError && (
                      <p className="text-xs text-destructive">{usernameError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Current username: {currentUser?.username}
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  type="submit"
                  form="personal-form"
                  disabled={updating || !!usernameError}
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form id="security-form" onSubmit={updatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-destructive">{passwordError}</p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  type="submit"
                  form="security-form"
                  disabled={updating || !!passwordError || !formData.newPassword}
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
