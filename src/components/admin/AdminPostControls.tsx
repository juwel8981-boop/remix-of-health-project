import { useState, useEffect } from "react";
import { Edit, Eye, EyeOff, Trash2, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Post {
  id: string;
  author: string;
  authorRole: string;
  authorImage: string;
  authorId: string;
  content: string;
  images: string[];
  category: string;
  time: string;
  status?: string;
}

interface AdminPostControlsProps {
  post: Post;
  onUpdate: () => void;
}

const categories = [
  "General",
  "Heart Health",
  "Mental Health",
  "Nutrition",
  "Fitness",
  "Women's Health",
  "Child Care",
  "Diabetes",
  "COVID-19",
];

export default function AdminPostControls({ post, onUpdate }: AdminPostControlsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editForm, setEditForm] = useState({
    content: "",
    category: "General",
  });

  useEffect(() => {
    checkAdminStatus();
    // Parse content to remove feeling tag for editing
    let content = post.content;
    const feelingMatch = content.match(/\[feeling:[^\]]+\]\s*/);
    if (feelingMatch) {
      content = content.replace(feelingMatch[0], "");
    }
    const reshareMatch = content.match(/\[reshare:[^\]]+\]\s*/);
    if (reshareMatch) {
      content = content.replace(reshareMatch[0], "");
    }
    setEditForm({
      content: content,
      category: post.category,
    });
  }, [post]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  if (!isAdmin) return null;

  const handleToggleStatus = async () => {
    setProcessing(true);
    const newStatus = post.status === "approved" ? "hidden" : "approved";
    
    const { error } = await supabase
      .from("health_posts")
      .update({ status: newStatus })
      .eq("id", post.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Post ${newStatus === "approved" ? "approved" : "hidden"}`);
      onUpdate();
    }
  };

  const handleUpdatePost = async () => {
    setProcessing(true);
    
    const { error } = await supabase
      .from("health_posts")
      .update({
        content: editForm.content,
        category: editForm.category,
      })
      .eq("id", post.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update post");
      console.error(error);
    } else {
      toast.success("Post updated successfully");
      setShowEditDialog(false);
      onUpdate();
    }
  };

  const handleRejectPost = async () => {
    setProcessing(true);
    
    const { error } = await supabase
      .from("health_posts")
      .update({ 
        status: "rejected",
        rejection_reason: rejectionReason || "Content violates community guidelines"
      })
      .eq("id", post.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to reject post");
    } else {
      toast.success("Post rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      onUpdate();
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    
    const { error } = await supabase
      .from("health_posts")
      .delete()
      .eq("id", post.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted");
      setShowDeleteDialog(false);
      onUpdate();
    }
  };

  return (
    <>
      {/* Admin Control Bar */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Controls</span>
            {post.status && post.status !== "approved" && (
              <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded">
                {post.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={processing}
              className="gap-1"
            >
              {post.status === "approved" ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectDialog(true)}
              className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <AlertTriangle className="w-4 h-4" />
              Flag
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePost} disabled={processing}>
              {processing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Flag/Reject Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will mark the post as rejected and hide it from the public feed.
            </p>
            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Content violates community guidelines..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectPost} disabled={processing}>
              {processing ? "Rejecting..." : "Reject Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {processing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
