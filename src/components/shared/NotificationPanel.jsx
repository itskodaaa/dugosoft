import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, AlertCircle, Clock, Info, Trash2, CheckCheck } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "success", title: "Resume analysis complete", message: "Your ATS score improved to 87%.", time: "2m ago", read: false },
  { id: 2, type: "warning", title: "Plan limit approaching", message: "You've used 9/10 resume builds this month.", time: "1h ago", read: false },
  { id: 3, type: "info", title: "New feature available", message: "Skill Gap Analysis is now live!", time: "3h ago", read: false },
  { id: 4, type: "success", title: "File conversion done", message: "Report.pdf was converted to Excel.", time: "1d ago", read: true },
  { id: 5, type: "info", title: "CV Vault updated", message: "French CV version saved successfully.", time: "2d ago", read: true },
];

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  warning: { icon: AlertCircle,  color: "text-orange-500", bg: "bg-orange-500/10" },
  info:    { icon: Info,         color: "text-accent",     bg: "bg-accent/10" },
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unread = notifications.filter(n => !n.read).length;

  const markAll = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const remove  = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const markOne = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors relative"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-40 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-foreground" />
                  <span className="font-bold text-sm text-foreground">Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button onClick={markAll} title="Mark all read"
                      className="flex items-center gap-1 text-[11px] text-accent font-semibold hover:underline px-1">
                      <CheckCheck className="w-3 h-3" /> All read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const cfg = TYPE_CONFIG[n.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={n.id}
                        onClick={() => markOne(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read ? "bg-accent/5" : ""}`}>
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-foreground ${!n.read ? "font-bold" : ""}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground/60" />
                            <span className="text-[10px] text-muted-foreground/60">{n.time}</span>
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); remove(n.id); }}
                          className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}