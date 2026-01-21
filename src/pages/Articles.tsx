import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, Share2, Send, Image, X, MoreHorizontal,
  ThumbsUp, Smile, Video, Globe, LogIn, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  replies?: Comment[];
}

interface Post {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  comments?: Comment[];
}

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
}

const categories = [
  "All",
  "Heart Health",
  "Mental Health",
  "Nutrition",
  "Fitness",
  "Women's Health",
  "Child Care",
  "Diabetes",
  "COVID-19",
  "General",
];

export default function Articles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("General");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const isAuthenticated = !!session;

  // Fetch user session and profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile for avatar
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch posts from database
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from("health_posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch comments for each post
      const postsWithComments = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: comments } = await supabase
            .from("post_comments")
            .select("*")
            .eq("post_id", post.id)
            .eq("status", "approved")
            .is("parent_id", null)
            .order("created_at", { ascending: true });

          // Fetch replies for each comment
          const commentsWithReplies = await Promise.all(
            (comments || []).map(async (comment) => {
              const { data: replies } = await supabase
                .from("post_comments")
                .select("*")
                .eq("parent_id", comment.id)
                .eq("status", "approved")
                .order("created_at", { ascending: true });
              
              return { ...comment, replies: replies || [] };
            })
          );

          return { ...post, comments: commentsWithReplies };
        })
      );

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      toast.error(`Please login to ${action}`, {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return false;
    }
    return true;
  };

  const filteredPosts = posts.filter((post) => {
    return selectedCategory === "All" || post.category === selectedCategory;
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setNewPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setNewPostImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleCreatePost = async () => {
    if (!requireAuth("create posts")) return;
    if (!newPostContent.trim()) {
      toast.error("Please write something to post");
      return;
    }

    setPosting(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (newPostImage && session?.user) {
        const fileExt = newPostImage.name.split(".").pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("health-posts")
          .upload(fileName, newPostImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("health-posts")
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("health_posts").insert({
        user_id: session!.user.id,
        author_name: userProfile?.full_name || session!.user.email?.split("@")[0] || "Anonymous",
        author_avatar: userProfile?.avatar_url,
        content: newPostContent,
        image_url: imageUrl,
        category: newPostCategory,
        status: "approved", // For now, auto-approve
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;

      toast.success("Post created successfully!");
      setNewPostContent("");
      setNewPostCategory("General");
      removeImage();
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!requireAuth("like posts")) return;
    
    const isLiked = likedPosts.has(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    const newLikedPosts = new Set(likedPosts);
    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    // Update likes count in database
    const newLikesCount = isLiked ? post.likes_count - 1 : post.likes_count + 1;
    
    const { error } = await supabase
      .from("health_posts")
      .update({ likes_count: Math.max(0, newLikesCount) })
      .eq("id", postId);

    if (error) {
      // Revert on error
      if (isLiked) {
        newLikedPosts.add(postId);
      } else {
        newLikedPosts.delete(postId);
      }
      setLikedPosts(newLikedPosts);
      toast.error("Failed to update like");
    } else {
      // Update local state
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes_count: Math.max(0, newLikesCount) } : p
      ));
    }
  };

  const addComment = async (postId: string) => {
    if (!requireAuth("comment on posts")) return;
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: session!.user.id,
        author_name: userProfile?.full_name || session!.user.email?.split("@")[0] || "Anonymous",
        content: text,
        status: "approved",
      });

      if (error) throw error;

      // Update comments count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from("health_posts")
          .update({ comments_count: (post.comments_count || 0) + 1 })
          .eq("id", postId);
      }

      setCommentText({ ...commentText, [postId]: "" });
      toast.success("Comment added!");
      fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const addReply = async (postId: string, commentId: string) => {
    if (!requireAuth("reply to comments")) return;
    if (!replyText.trim()) return;

    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: session!.user.id,
        author_name: userProfile?.full_name || session!.user.email?.split("@")[0] || "Anonymous",
        content: replyText,
        parent_id: commentId,
        status: "approved",
      });

      if (error) throw error;

      setReplyTo(null);
      setReplyText("");
      toast.success("Reply added!");
      fetchPosts();
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const sharePost = (postId: string) => {
    const url = `${window.location.origin}/health-feed/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-8">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Health Feed
            </h1>
            <p className="text-primary-foreground/80">
              Share health tips, ask questions, and connect with the community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-card sticky top-16 md:top-20 z-40">
        <div className="healthcare-container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="healthcare-container py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Create Post Card */}
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-sm border border-border p-4"
            >
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback>
                    {userProfile?.full_name?.[0] || session?.user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share a health tip, ask a question, or start a discussion..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                  />
                  
                  {/* Category Selection */}
                  <div className="mt-2">
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0 outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative mt-3 inline-block">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                          asChild
                        >
                          <span>
                            <Image className="w-5 h-5 mr-1" />
                            Photo
                          </span>
                        </Button>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        disabled
                      >
                        <Video className="w-5 h-5 mr-1" />
                        Video
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hidden sm:flex"
                        disabled
                      >
                        <Smile className="w-5 h-5 mr-1" />
                        Feeling
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || posting}
                      size="sm"
                    >
                      {posting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-sm border border-border p-6 text-center"
            >
              <LogIn className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Join the conversation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Login to like, comment, and share health tips with the community
              </p>
              <Button onClick={() => navigate("/login")}>
                <LogIn className="w-4 h-4 mr-2" />
                Login to Participate
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Posts Feed */}
          {!loading && (
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author_avatar || ""} />
                          <AvatarFallback>{post.author_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{post.author_name}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(post.created_at)}</span>
                            <span>•</span>
                            <Globe className="w-3 h-3" />
                            <span>{post.category || "General"}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sharePost(post.id)}>
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem>Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <div className="mt-3">
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="w-full">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b border-border">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span>{post.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                        className="hover:underline"
                      >
                        {post.comments?.length || 0} comments
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-1 flex items-center justify-around border-b border-border">
                    <Button
                      variant="ghost"
                      className={`flex-1 gap-2 ${likedPosts.has(post.id) ? "text-primary" : "text-muted-foreground"}`}
                      onClick={() => toggleLike(post.id)}
                    >
                      <ThumbsUp className={`w-5 h-5 ${likedPosts.has(post.id) ? "fill-primary" : ""}`} />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-muted-foreground"
                      onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Comment
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-muted-foreground"
                      onClick={() => sharePost(post.id)}
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {showComments[post.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {/* Comment Input */}
                          {isAuthenticated && (
                            <div className="flex gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={userProfile?.avatar_url || ""} />
                                <AvatarFallback>
                                  {userProfile?.full_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText[post.id] || ""}
                                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                                  onKeyPress={(e) => e.key === "Enter" && addComment(post.id)}
                                  className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => addComment(post.id)}
                                  disabled={!commentText[post.id]?.trim()}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Comments List */}
                          {post.comments?.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{comment.author_name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted rounded-2xl px-3 py-2">
                                    <p className="font-semibold text-sm text-foreground">{comment.author_name}</p>
                                    <p className="text-sm text-foreground">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 ml-2 text-xs">
                                    {isAuthenticated && (
                                      <button
                                        onClick={() => setReplyTo({ postId: post.id, commentId: comment.id })}
                                        className="font-semibold text-muted-foreground hover:underline"
                                      >
                                        Reply
                                      </button>
                                    )}
                                    <span className="text-muted-foreground">{formatTime(comment.created_at)}</span>
                                  </div>

                                  {/* Replies */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-2 ml-4 space-y-2">
                                      {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-2">
                                          <Avatar className="w-6 h-6">
                                            <AvatarFallback>{reply.author_name?.[0] || "U"}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="bg-muted rounded-2xl px-3 py-2">
                                              <p className="font-semibold text-xs text-foreground">{reply.author_name}</p>
                                              <p className="text-xs text-foreground">{reply.content}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
                                              <span>{formatTime(reply.created_at)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reply Input */}
                                  {replyTo?.postId === post.id && replyTo?.commentId === comment.id && (
                                    <div className="mt-2 ml-4 flex gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={userProfile?.avatar_url || ""} />
                                        <AvatarFallback>
                                          {userProfile?.full_name?.[0] || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 flex gap-2">
                                        <input
                                          type="text"
                                          placeholder={`Reply to ${comment.author_name}...`}
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          onKeyPress={(e) => e.key === "Enter" && addReply(post.id, comment.id)}
                                          className="flex-1 bg-muted rounded-full px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                                          autoFocus
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7"
                                          onClick={() => addReply(post.id, comment.id)}
                                        >
                                          <Send className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7"
                                          onClick={() => setReplyTo(null)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              ))}
            </AnimatePresence>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">No posts in this category yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
