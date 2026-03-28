import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          Settings
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your account preferences.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="rounded-xl ink-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Full Name
              </Label>
              <Input placeholder="John Doe" className="bg-muted border-0" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Email
              </Label>
              <Input placeholder="john@example.com" className="bg-muted border-0" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl ink-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Notification preferences will be available in a future update.
          </p>
        </div>

        {/* Security */}
        <div className="rounded-xl ink-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Password and security settings will be available in a future update.
          </p>
        </div>

        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-11 px-8 font-semibold"
          onClick={() => toast.success("Settings saved (simulated)")}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}