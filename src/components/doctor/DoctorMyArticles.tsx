import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Clock, CheckCircle2, XCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  content: string;
  category: string | null;
  status: string | null;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
  rejection_reason: string | null;
}

export function DoctorMyArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("health_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setArticles(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("health_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      fetchArticles();
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-healthcare-green-light text-healthcare-green">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
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
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            My Articles
          </h1>
          <p className="text-muted-foreground">
            Manage your health posts and articles
          </p>
        </motion.div>

        <Button variant="healthcare" asChild>
          <Link to="/health-feed">
            <Plus className="w-4 h-4 mr-2" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="healthcare-card text-center py-12"
        >
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Articles Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start sharing your knowledge with the community
          </p>
          <Button variant="healthcare" asChild>
            <Link to="/health-feed">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="healthcare-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(article.status)}
                    {article.category && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {article.category}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground line-clamp-2 mb-2">
                    {article.content}
                  </p>
                  {article.status === "rejected" && article.rejection_reason && (
                    <p className="text-sm text-destructive mb-2">
                      Rejection reason: {article.rejection_reason}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    <span>{article.likes_count || 0} likes</span>
                    <span>{article.comments_count || 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/health-feed">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
