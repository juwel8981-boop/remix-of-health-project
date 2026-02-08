import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, MessageCircle, ThumbsUp, ThumbsDown, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HealthPost {
  id: string;
  content: string;
  image_url: string | null;
  category: string | null;
  likes_count: number;
  comments_count: number;
  status: string;
  created_at: string;
}

export function PatientMyArticles() {
  const [posts, setPosts] = useState<HealthPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('health_posts')
        .select('id, content, image_url, category, likes_count, comments_count, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setPosts(data);
      }
    }
    setLoading(false);
  };

  const confirmDelete = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    const { error } = await supabase
      .from('health_posts')
      .delete()
      .eq('id', postToDelete);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Post deleted" });
      fetchPosts();
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-xs px-2 py-1 rounded-full bg-healthcare-green-light text-healthcare-green">Published</span>;
      case 'pending':
        return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
      case 'rejected':
        return <span className="text-xs px-2 py-1 rounded-full bg-healthcare-red-light text-healthcare-red">Rejected</span>;
      default:
        return null;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">My Medical Community Posts</h2>
          <p className="text-muted-foreground">View and manage your contributions to the Medical Community</p>
        </div>
        <Button asChild>
          <Link to="/health-feed">
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Medical Community
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="healthcare-card text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
          <p className="text-sm text-muted-foreground">Total Posts</p>
        </div>
        <div className="healthcare-card text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{posts.filter(p => p.status === 'approved').length}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
        <div className="healthcare-card text-center">
          <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}</p>
          <p className="text-sm text-muted-foreground">Total Likes</p>
        </div>
        <div className="healthcare-card text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}</p>
          <p className="text-sm text-muted-foreground">Total Comments</p>
        </div>
      </motion.div>

      {/* Posts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="healthcare-card"
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Your Posts</h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>You haven't posted anything yet</p>
            <Button variant="link" asChild>
              <Link to="/health-feed">Share your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 rounded-lg bg-muted group">
                <div className="flex gap-4">
                  {post.image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(post.status)}
                      {post.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{post.category}</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-foreground mb-2">{truncateContent(post.content)}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        0
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/health-feed#post-${post.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive" 
                      onClick={() => confirmDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from the Medical Community.
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
    </div>
  );
}
