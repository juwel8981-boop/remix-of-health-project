import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Heart, MessageCircle, Share2, Send, Image, X, MoreHorizontal,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
}

interface Post {
  id: string;
  author: string;
  authorRole: string;
  authorImage: string;
  content: string;
  images: string[];
  category: string;
  time: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  shares: number;
  feeling?: string;
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

const feelings = [
  { emoji: "😊", label: "Happy" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "🤒", label: "Sick" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🧘", label: "Relaxed" },
  { emoji: "💖", label: "Grateful" },
  { emoji: "🏃", label: "Energetic" },
  { emoji: "🤔", label: "Curious" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🎉", label: "Celebrating" },
];

export default function Articles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!session;

  // Fetch session and user profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to defer profile fetch
          setTimeout(() => fetchUserProfile(session.user.id), 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch posts from database
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to get from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (profileData) {
        setUserProfile({
          full_name: profileData.full_name || "User",
          avatar_url: profileData.avatar_url
        });
        return;
      }

      // If not in profiles, check patients table
      const { data: patientData } = await supabase
        .from("patients")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      if (patientData) {
        // Get avatar from profiles anyway for consistency
        const { data: avatarData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .single();
        
        setUserProfile({
          full_name: patientData.full_name,
          avatar_url: avatarData?.avatar_url || null
        });
        return;
      }

      // Check doctors table
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      if (doctorData) {
        const { data: avatarData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .single();
        
        setUserProfile({
          full_name: doctorData.full_name,
          avatar_url: avatarData?.avatar_url || null
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      // Fetch approved posts from health_posts table
      const { data: postsData, error } = await supabase
        .from("health_posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch comments for each post
      const postsWithComments = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: commentsData } = await supabase
            .from("post_comments")
            .select("*")
            .eq("post_id", post.id)
            .eq("status", "approved")
            .order("created_at", { ascending: true });

          const comments: Comment[] = (commentsData || []).map((c) => ({
            id: c.id,
            author: c.author_name,
            authorImage: "", // We'll need to fetch this separately if needed
            content: c.content,
            time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true }),
            likes: 0,
            liked: false,
            replies: [],
          }));

          // Parse content for feeling
          let feeling: string | undefined;
          let content = post.content;
          const feelingMatch = content.match(/\[feeling:([^\]]+)\]/);
          if (feelingMatch) {
            feeling = feelingMatch[1];
            content = content.replace(/\[feeling:[^\]]+\]\s*/, "");
          }

          return {
            id: post.id,
            author: post.author_name,
            authorRole: "Community Member",
            authorImage: post.author_avatar || "",
            content: content,
            images: post.image_url ? [post.image_url] : [],
            category: post.category || "General",
            time: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
            likes: post.likes_count || 0,
            liked: false,
            shares: 0,
            comments,
            feeling,
          };
        })
      );

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    }
  };

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

  const handleCreatePost = async () => {
    if (!requireAuth("create posts")) return;
    if (!newPostContent.trim() && newPostImages.length === 0) return;
    if (!session?.user || !userProfile) return;

    setPosting(true);
    try {
      // Include feeling in content if selected
      let content = newPostContent;
      if (selectedFeeling) {
        content = `[feeling:${selectedFeeling}] ${content}`;
      }

      const { data, error } = await supabase
        .from("health_posts")
        .insert({
          user_id: session.user.id,
          author_name: userProfile.full_name,
          author_avatar: userProfile.avatar_url,
          content: content,
          image_url: newPostImages[0] || null, // Store first image
          category: "General",
          status: "pending", // Posts need approval
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Post submitted! It will be visible after approval.");
      setNewPostContent("");
      setNewPostImages([]);
      setSelectedFeeling(null);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth("upload images")) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${session?.user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("health-posts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("health-posts")
        .getPublicUrl(fileName);

      setNewPostImages([...newPostImages, publicUrl]);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth("upload videos")) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size should be less than 50MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${session?.user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("health-posts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("health-posts")
        .getPublicUrl(fileName);

      setNewPostImages([...newPostImages, publicUrl]);
      toast.success("Video uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setNewPostImages(newPostImages.filter((_, i) => i !== index));
  };

  const toggleLike = async (postId: string) => {
    if (!requireAuth("like posts")) return;
    
    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1,
        };
      }
      return post;
    }));

    // Update in database
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newLikesCount = post.liked ? post.likes - 1 : post.likes + 1;
      
      await supabase
        .from("health_posts")
        .update({ likes_count: newLikesCount })
        .eq("id", postId);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    if (!requireAuth("like comments")) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                liked: !comment.liked,
                likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
              };
            }
            return comment;
          }),
        };
      }
      return post;
    }));
  };

  const addComment = async (postId: string) => {
    if (!requireAuth("comment on posts")) return;
    const text = commentText[postId];
    if (!text?.trim() || !session?.user || !userProfile) return;

    try {
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: session.user.id,
          author_name: userProfile.full_name,
          content: text,
        });

      if (error) throw error;

      // Optimistically add comment to UI
      const newComment: Comment = {
        id: Date.now().toString(),
        author: userProfile.full_name,
        authorImage: userProfile.avatar_url || "",
        content: text,
        time: "Just now",
        likes: 0,
        liked: false,
        replies: [],
      };

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      }));

      setCommentText({ ...commentText, [postId]: "" });

      // Update comments count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from("health_posts")
          .update({ comments_count: post.comments.length + 1 })
          .eq("id", postId);
      }

      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const addReply = (postId: string, commentId: string) => {
    if (!requireAuth("reply to comments")) return;
    if (!replyText.trim() || !userProfile) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      author: userProfile.full_name,
      authorImage: userProfile.avatar_url || "",
      content: replyText,
      time: "Just now",
      likes: 0,
      liked: false,
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...comment.replies, newReply],
              };
            }
            return comment;
          }),
        };
      }
      return post;
    }));

    setReplyTo(null);
    setReplyText("");
  };

  const sharePost = async (postId: string) => {
    if (!requireAuth("share posts")) return;
    
    // Copy link to clipboard
    const url = `${window.location.origin}/health-feed/${postId}`;
    await navigator.clipboard.writeText(url);
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    
    toast.success("Link copied to clipboard!");
  };

  const currentUserImage = userProfile?.avatar_url || "";
  const currentUserName = userProfile?.full_name || "User";

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoUpload}
      />

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
                  <AvatarImage src={currentUserImage} />
                  <AvatarFallback>{currentUserName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {/* Feeling indicator */}
                  {selectedFeeling && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Feeling <span className="font-medium text-foreground">{selectedFeeling}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setSelectedFeeling(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  <Textarea
                    placeholder="Share a health tip, ask a question, or start a discussion..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                  />
                  
                  {/* Image/Video Preview */}
                  {newPostImages.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {newPostImages.map((media, index) => (
                        <div key={index} className="relative">
                          {media.includes(".mp4") || media.includes(".webm") || media.includes(".mov") ? (
                            <video
                              src={media}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <img
                              src={media}
                              alt="Upload preview"
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                        ) : (
                          <Image className="w-5 h-5 mr-1" />
                        )}
                        Photo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Video className="w-5 h-5 mr-1" />
                        Video
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-muted-foreground hover:text-primary ${
                              selectedFeeling ? "text-primary" : ""
                            }`}
                          >
                            <Smile className="w-5 h-5 mr-1" />
                            Feeling
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="grid grid-cols-5 gap-1">
                            {feelings.map((feeling) => (
                              <button
                                key={feeling.label}
                                onClick={() => setSelectedFeeling(`${feeling.emoji} ${feeling.label}`)}
                                className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors"
                                title={feeling.label}
                              >
                                <span className="text-xl">{feeling.emoji}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{feeling.label}</span>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={(!newPostContent.trim() && newPostImages.length === 0) || posting}
                      size="sm"
                    >
                      {posting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Posts Feed */}
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
                        <AvatarImage src={post.authorImage} />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{post.author}</h3>
                          {post.feeling && (
                            <span className="text-sm text-muted-foreground">
                              is feeling {post.feeling}
                            </span>
                          )}
                          {post.authorRole !== "Community Member" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {post.authorRole}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.time}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3" />
                          <span>{post.category}</span>
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
                        <DropdownMenuItem>Save post</DropdownMenuItem>
                        <DropdownMenuItem>Hide post</DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Post Content */}
                  <div className="mt-3">
                    <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                {/* Post Images/Videos */}
                {post.images.length > 0 && (
                  <div className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-0.5`}>
                    {post.images.map((media, imgIndex) => (
                      media.includes(".mp4") || media.includes(".webm") || media.includes(".mov") ? (
                        <video
                          key={imgIndex}
                          src={media}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <img
                          key={imgIndex}
                          src={media}
                          alt={`Post image ${imgIndex + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b border-border">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <ThumbsUp className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                      className="hover:underline"
                    >
                      {post.comments.length} comments
                    </button>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-1 flex items-center justify-around border-b border-border">
                  <Button
                    variant="ghost"
                    className={`flex-1 gap-2 ${post.liked ? "text-primary" : "text-muted-foreground"}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <ThumbsUp className={`w-5 h-5 ${post.liked ? "fill-primary" : ""}`} />
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
                        <div className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={currentUserImage} />
                            <AvatarFallback>{currentUserName[0]}</AvatarFallback>
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

                        {/* Comments List */}
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="space-y-2">
                            <div className="flex gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.authorImage} />
                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted rounded-2xl px-3 py-2">
                                  <p className="font-semibold text-sm text-foreground">{comment.author}</p>
                                  <p className="text-sm text-foreground">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-2 text-xs">
                                  <button
                                    onClick={() => toggleCommentLike(post.id, comment.id)}
                                    className={`font-semibold hover:underline ${comment.liked ? "text-primary" : "text-muted-foreground"}`}
                                  >
                                    Like {comment.likes > 0 && `(${comment.likes})`}
                                  </button>
                                  <button
                                    onClick={() => setReplyTo({ postId: post.id, commentId: comment.id })}
                                    className="font-semibold text-muted-foreground hover:underline"
                                  >
                                    Reply
                                  </button>
                                  <span className="text-muted-foreground">{comment.time}</span>
                                </div>

                                {/* Replies */}
                                {comment.replies.length > 0 && (
                                  <div className="mt-2 ml-4 space-y-2">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="flex gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarImage src={reply.authorImage} />
                                          <AvatarFallback>{reply.author[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="bg-muted rounded-2xl px-3 py-2">
                                            <p className="font-semibold text-xs text-foreground">{reply.author}</p>
                                            <p className="text-xs text-foreground">{reply.content}</p>
                                          </div>
                                          <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
                                            <button className="font-semibold hover:underline">Like</button>
                                            <span>{reply.time}</span>
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
                                      <AvatarImage src={currentUserImage} />
                                      <AvatarFallback>{currentUserName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                      <input
                                        type="text"
                                        placeholder={`Reply to ${comment.author}...`}
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
