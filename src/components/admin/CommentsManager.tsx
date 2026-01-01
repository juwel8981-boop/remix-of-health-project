import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, CheckCircle2, XCircle, Eye, Trash2,
  Search, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  status: string;
  created_at: string;
  parent_id: string | null;
  post_content?: string;
}

export default function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("post_comments")
      .select(`
        *,
        health_posts (content)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to fetch comments");
    } else {
      const formattedComments = (data || []).map(comment => ({
        ...comment,
        post_content: comment.health_posts?.content?.slice(0, 100) + "..." || "Post not found"
      }));
      setComments(formattedComments);
    }
    setLoading(false);
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = comments.filter(c => c.status === "pending").length;
  const approvedCount = comments.filter(c => c.status === "approved").length;
  const rejectedCount = comments.filter(c => c.status === "rejected").length;

  const handleApprove = async (comment: Comment) => {
    const { error } = await supabase
      .from("post_comments")
      .update({ status: "approved" })
      .eq("id", comment.id);

    if (error) {
      toast.error("Failed to approve comment");
    } else {
      toast.success("Comment approved");
      fetchComments();
    }
  };

  const handleReject = async (comment: Comment) => {
    const { error } = await supabase
      .from("post_comments")
      .update({ status: "rejected" })
      .eq("id", comment.id);

    if (error) {
      toast.error("Failed to reject comment");
    } else {
      toast.success("Comment rejected");
      setRejectDialogOpen(false);
      setSelectedComment(null);
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentToDelete.id);

    if (error) {
      toast.error("Failed to delete comment");
    } else {
      toast.success("Comment deleted");
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
      fetchComments();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-healthcare-green/10 text-healthcare-green border-healthcare-green/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Comments Moderation</h1>
        <p className="text-muted-foreground">Moderate user comments on health posts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-healthcare-green">{approvedCount}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="healthcare-card"
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{comment.author_name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{comment.author_name}</span>
                  {getStatusBadge(comment.status)}
                </div>
                <p className="text-muted-foreground text-xs mb-2">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
                <p className="text-foreground mb-3">{comment.content}</p>
                
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">On post:</p>
                  <p className="text-sm text-foreground">{comment.post_content}</p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  {comment.status === "pending" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-healthcare-green border-healthcare-green hover:bg-healthcare-green hover:text-white"
                        onClick={() => handleApprove(comment)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleReject(comment)}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {comment.status === "rejected" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-healthcare-green border-healthcare-green hover:bg-healthcare-green hover:text-white"
                      onClick={() => handleApprove(comment)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  )}
                  {comment.status === "approved" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleReject(comment)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setCommentToDelete(comment);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredComments.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
