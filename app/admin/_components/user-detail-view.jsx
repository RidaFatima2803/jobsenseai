"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Mail,
  Briefcase,
  Calendar,
  UserCircle,
  BookOpen,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function UserDetailView({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({ name: user.name || "", email: user.email || "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const updated = await res.json();
      setUser((u) => ({ ...u, ...updated }));
      setEditOpen(false);
      toast.success("User updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("User deleted");
      router.push("/admin/users");
    } catch {
      toast.error("Failed to delete user");
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: `Documents (${(user.coverLetter?.length || 0) + (user.resume ? 1 : 0)})` },
    { id: "assessments", label: `Assessments (${user.assessments?.length || 0})` },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 self-start"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        <div className="flex items-center gap-3 sm:ml-auto">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{user.name || "Unnamed User"}</h1>
                {user.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {user.industry.replace(/-/g, " ")}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Resume", value: user.resume ? "1" : "0" },
          { icon: MessageSquare, label: "Cover Letters", value: String(user.coverLetter?.length || 0) },
          { icon: BarChart2, label: "Assessments", value: String(user.assessments?.length || 0) },
          { icon: Briefcase, label: "Experience", value: user.experience != null ? `${user.experience} yr${user.experience !== 1 ? "s" : ""}` : "—" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Briefcase} label="Industry" value={user.industry?.replace(/-/g, " ")} />
              <InfoRow icon={Calendar} label="Experience" value={user.experience != null ? `${user.experience} years` : null} />
              <InfoRow icon={BookOpen} label="Bio" value={user.bio} />
              {user.skills?.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            {user.resume && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Resume</CardTitle>
                    {user.resume.atsScore != null && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        ATS {user.resume.atsScore.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Last updated {formatDistanceToNow(new Date(user.resume.updatedAt), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            )}
            {user.coverLetter?.map((cl) => (
              <Card key={cl.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm truncate">{cl.jobTitle} at {cl.companyName}</CardTitle>
                    <Badge variant={cl.status === "completed" ? "default" : "secondary"} className="text-xs ml-auto shrink-0">
                      {cl.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(cl.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            ))}
            {!user.resume && (!user.coverLetter || user.coverLetter.length === 0) && (
              <p className="text-sm text-muted-foreground py-6 text-center">No documents generated yet.</p>
            )}
          </div>
        )}

        {activeTab === "assessments" && (
          <div className="space-y-3">
            {user.assessments?.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No assessments taken yet.</p>
            )}
            {user.assessments?.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{a.category} Quiz</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(a.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {a.improvementTip && (
                      <p className="text-xs text-muted-foreground mt-2 max-w-md line-clamp-2 italic">
                        "{a.improvementTip}"
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold tabular-nums">{a.quizScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">{a.questions?.length || 0} questions</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update this user's name or email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user.name || user.email}</strong> and all
              their data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
