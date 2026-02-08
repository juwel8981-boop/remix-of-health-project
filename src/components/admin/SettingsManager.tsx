import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, Globe, Bell, Shield, Users, Save, 
  RefreshCw, Mail, Languages, Upload, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SiteSetting {
  key: string;
  value: string | boolean | number | string[];
  description: string;
}

interface UserRole {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
}

// Mock data
const mockSettings: SiteSetting[] = [
  { key: "site_name", value: "MedConnect Bangladesh", description: "The name of the website" },
  { key: "site_description", value: "Your trusted healthcare platform in Bangladesh", description: "Website description" },
  { key: "maintenance_mode", value: false, description: "Enable or disable maintenance mode" },
  { key: "allow_registrations", value: true, description: "Allow new user registrations" },
  { key: "require_post_approval", value: true, description: "Require admin approval for health posts" },
  { key: "email_notifications", value: true, description: "Enable email notifications" },
  { key: "max_upload_size_mb", value: 10, description: "Maximum file upload size in MB" },
];

const mockUsers: UserRole[] = [
  { id: "1", email: "admin@medconnect.bd", full_name: "System Admin", role: "admin", created_at: "2024-01-01" },
  { id: "2", email: "mod1@medconnect.bd", full_name: "Dr. Rahman", role: "moderator", created_at: "2024-02-15" },
  { id: "3", email: "mod2@medconnect.bd", full_name: "Fatima Begum", role: "moderator", created_at: "2024-03-10" },
  { id: "4", email: "user@example.com", full_name: "Regular User", role: "user", created_at: "2024-04-20" },
];

export default function SettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>(mockSettings);
  const [users, setUsers] = useState<UserRole[]>(mockUsers);
  const [isSaving, setIsSaving] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "moderator" | "user">("user");

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleRoleChange = (userId: string, newRole: "admin" | "moderator" | "user") => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({
      title: "Role updated",
      description: `User role has been changed to ${newRole}.`,
    });
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "User removed",
      description: "User has been removed from roles.",
      variant: "destructive",
    });
  };

  const handleAddUser = () => {
    if (!newUserEmail) return;
    const newUser: UserRole = {
      id: Date.now().toString(),
      email: newUserEmail,
      full_name: newUserEmail.split("@")[0],
      role: newUserRole,
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    toast({
      title: "User added",
      description: `${newUserEmail} has been assigned the ${newUserRole} role.`,
    });
    setAddUserOpen(false);
    setNewUserEmail("");
    setNewUserRole("user");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary text-primary-foreground">Admin</Badge>;
      case "moderator":
        return <Badge className="bg-accent text-accent-foreground">Moderator</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and manage user roles</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">User Roles</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic site settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.find(s => s.key === "site_name")?.value as string}
                    onChange={(e) => handleSettingChange("site_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Input
                    id="site_description"
                    value={settings.find(s => s.key === "site_description")?.value as string}
                    onChange={(e) => handleSettingChange("site_description", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable the site for maintenance</p>
                  </div>
                  <Switch
                    checked={settings.find(s => s.key === "maintenance_mode")?.value as boolean}
                    onCheckedChange={(checked) => handleSettingChange("maintenance_mode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Registrations</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.find(s => s.key === "allow_registrations")?.value as boolean}
                    onCheckedChange={(checked) => handleSettingChange("allow_registrations", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_upload">Max Upload Size (MB)</Label>
                  <Input
                    id="max_upload"
                    type="number"
                    value={settings.find(s => s.key === "max_upload_size_mb")?.value as number}
                    onChange={(e) => handleSettingChange("max_upload_size_mb", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Button variant="healthcare" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.find(s => s.key === "email_notifications")?.value as boolean}
                    onCheckedChange={(checked) => handleSettingChange("email_notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>New Registration Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label>Content Pending Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when content needs review</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button variant="healthcare" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Post Approval</Label>
                    <p className="text-sm text-muted-foreground">All medical community posts require admin approval</p>
                  </div>
                  <Switch
                    checked={settings.find(s => s.key === "require_post_approval")?.value as boolean}
                    onCheckedChange={(checked) => handleSettingChange("require_post_approval", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Doctor Verification Required</Label>
                    <p className="text-sm text-muted-foreground">Verify credentials before listing doctors</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Spam Detection</Label>
                    <p className="text-sm text-muted-foreground">Automatically detect and flag spam content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button variant="healthcare" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Role Management</CardTitle>
                <CardDescription>Manage admin and moderator access</CardDescription>
              </div>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button variant="healthcare">
                    <Users className="w-4 h-4 mr-2" /> Add User Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add User Role</DialogTitle>
                    <DialogDescription>
                      Assign a role to an existing user by their email address.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>User Email</Label>
                      <Input
                        placeholder="user@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newUserRole} onValueChange={(v: "admin" | "moderator" | "user") => setNewUserRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                    <Button variant="healthcare" onClick={handleAddUser}>Add Role</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.full_name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select 
                        value={user.role} 
                        onValueChange={(v: "admin" | "moderator" | "user") => handleRoleChange(user.id, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
