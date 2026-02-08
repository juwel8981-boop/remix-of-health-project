import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, CheckCircle2, XCircle, Eye, MessageSquare, 
  Search, Clock, Trash2, ThumbsUp
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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  status: string | null;
  rejection_reason: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
}

export default function ContentManager() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("health_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
      console.error(error);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = posts.filter(p => p.status === "pending").length;
  const approvedCount = posts.filter(p => p.status === "approved").length;
  const rejectedCount = posts.filter(p => p.status === "rejected").length;

  const handleApprove = async (post: Post) => {
    setProcessingId(post.id);
    const { error } = await supabase
      .from("health_posts")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", post.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Post approved",
        description: `"${post.content.slice(0, 50)}..." has been approved and is now visible.`,
      });
      fetchPosts();
    }
    setProcessingId(null);
  };

  const handleReject = async () => {
    if (!selectedPost || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedPost.id);
    const { error } = await supabase
      .from("health_posts")
      .update({ status: "rejected", rejection_reason: rejectionReason })
      .eq("id", selectedPost.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Post rejected",
        description: "The post has been rejected and the author will be notified.",
        variant: "destructive",
      });
      fetchPosts();
    }
    setRejectDialogOpen(false);
    setRejectionReason("");
    setSelectedPost(null);
    setProcessingId(null);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    setProcessingId(postToDelete.id);
    const { error } = await supabase
      .from("health_posts")
      .delete()
      .eq("id", postToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Post deleted",
        description: "The post has been permanently removed.",
        variant: "destructive",
      });
      fetchPosts();
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    setProcessingId(null);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-healthcare-green/10 text-healthcare-green border-healthcare-green/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
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
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Medical Community Management</h1>
        <p className="text-muted-foreground">Moderate community health posts and discussions</p>
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
            placeholder="Search posts..."
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="Health Tips">Health Tips</SelectItem>
            <SelectItem value="Experience">Experience</SelectItem>
            <SelectItem value="Announcement">Announcement</SelectItem>
            <SelectItem value="Question">Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="healthcare-card"
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author_avatar || ""} />
                <AvatarFallback>{post.author_name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground">{post.author_name}</span>
                  {getStatusBadge(post.status)}
                  <Badge variant="secondary" className="text-xs">{post.category || "General"}</Badge>
                </div>
                <p className="text-muted-foreground text-xs mb-2">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
                <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
                
                {post.image_url && (
                  <div className="relative mb-3">
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="rounded-lg max-h-48 object-cover w-full"
                    />
                  </div>
                )}

                {post.rejection_reason && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                    <p className="text-sm text-destructive font-medium">Rejection Reason:</p>
                    <p className="text-sm text-muted-foreground">{post.rejection_reason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {post.comments_count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedPost(post);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {post.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-healthcare-green border-healthcare-green hover:bg-healthcare-green hover:text-white"
                          onClick={() => handleApprove(post)}
                          disabled={processingId === post.id}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                          onClick={() => {
                            setSelectedPost(post);
                            setRejectDialogOpen(true);
                          }}
                          disabled={processingId === post.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setPostToDelete(post);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={processingId === post.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this post. The author will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this post? This action cannot be undone.
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={selectedPost.author_avatar || ""} />
                  <AvatarFallback>{selectedPost.author_name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPost.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedPost.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-foreground mb-4 whitespace-pre-wrap">{selectedPost.content}</p>
              {selectedPost.image_url && (
                <img 
                  src={selectedPost.image_url} 
                  alt="Post" 
                  className="rounded-lg w-full"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
