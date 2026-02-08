import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, Send, Image, X, MoreHorizontal,
  ThumbsUp, ThumbsDown, Smile, Video, Globe, LogIn, Loader2, Repeat2, Edit2, Trash2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { formatDistanceToNow } from "date-fns";

// Reaction types (Reddit-style: Like/Dislike only)
type ReactionType = "like" | "dislike";

interface Comment {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  userId: string;
  reaction?: string;
  reactions: Record<string, number>;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  userId: string;
  reaction?: string;
  reactions: Record<string, number>;
}

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
  reaction?: string;
  reactions: Record<string, number>;
  comments: Comment[];
  shares: number;
  feeling?: string;
  originalPost?: {
    id: string;
    author: string;
    authorImage: string;
    content: string;
  };
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

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePost, setSharePostData] = useState<Post | null>(null);
  const [shareThoughts, setShareThoughts] = useState("");
  const [sharing, setSharing] = useState(false);

  // Edit comment state
  const [editCommentDialog, setEditCommentDialog] = useState<{
    postId: string;
    commentId: string;
    content: string;
  } | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Delete comment state
  const [deleteCommentDialog, setDeleteCommentDialog] = useState<{
    postId: string;
    commentId: string;
  } | null>(null);

  const isAuthenticated = !!session;

  // Fetch session and user profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
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

      const { data: patientData } = await supabase
        .from("patients")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      if (patientData) {
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
      // Fetch all approved doctors to identify doctor authors
      const { data: doctorsData } = await supabase
        .from("doctors")
        .select("user_id, full_name, specialization")
        .eq("verification_status", "approved");

      const doctorUserIds = new Set((doctorsData || []).map(d => d.user_id));
      const doctorInfoMap = new Map(
        (doctorsData || []).map(d => [d.user_id, { name: d.full_name, specialization: d.specialization }])
      );

      const { data: postsData, error } = await supabase
        .from("health_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithComments = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: commentsData } = await supabase
            .from("post_comments")
            .select("*")
            .eq("post_id", post.id)
            .is("parent_id", null)
            .order("created_at", { ascending: true });

          const comments: Comment[] = (commentsData || []).map((c) => ({
            id: c.id,
            author: c.author_name,
            authorImage: "",
            content: c.content,
            time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true }),
            userId: c.user_id,
            reactions: {},
            replies: [],
          }));

          let feeling: string | undefined;
          let content = post.content;
          const feelingMatch = content.match(/\[feeling:([^\]]+)\]/);
          if (feelingMatch) {
            feeling = feelingMatch[1];
            content = content.replace(/\[feeling:[^\]]+\]\s*/, "");
          }

          // Check for reshare
          let originalPost: Post["originalPost"] | undefined;
          const reshareMatch = content.match(/\[reshare:([^\]]+)\]/);
          if (reshareMatch) {
            try {
              originalPost = JSON.parse(reshareMatch[1]);
              content = content.replace(/\[reshare:[^\]]+\]\s*/, "");
            } catch (e) {
              console.error("Error parsing reshare data:", e);
            }
          }

          // Check if author is a verified doctor
          const isDoctor = doctorUserIds.has(post.user_id);
          const doctorInfo = doctorInfoMap.get(post.user_id);
          const authorRole = isDoctor 
            ? `Verified Doctor • ${doctorInfo?.specialization || "Healthcare Professional"}`
            : "Community Member";

          return {
            id: post.id,
            author: post.author_name,
            authorRole,
            authorImage: post.author_avatar || "",
            authorId: post.user_id,
            content: content,
            images: post.image_url ? [post.image_url] : [],
            category: post.category || "General",
            time: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
            reactions: {},
            shares: 0,
            comments,
            feeling,
            originalPost,
            isDoctor, // Add flag for sorting
          };
        })
      );

      // Sort posts: doctor posts first, then by time
      const sortedPosts = postsWithComments.sort((a, b) => {
        // First prioritize doctor posts
        if ((a as any).isDoctor && !(b as any).isDoctor) return -1;
        if (!(a as any).isDoctor && (b as any).isDoctor) return 1;
        // Then sort by time (already sorted from DB, but maintain order within groups)
        return 0;
      });

      setPosts(sortedPosts);
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
      let content = newPostContent;
      if (selectedFeeling) {
        content = `[feeling:${selectedFeeling}] ${content}`;
      }

      const { error } = await supabase
        .from("health_posts")
        .insert({
          user_id: session.user.id,
          author_name: userProfile.full_name,
          author_avatar: userProfile.avatar_url,
          content: content,
          image_url: newPostImages[0] || null,
          category: "General",
          status: "approved",
        });

      if (error) throw error;

      toast.success("Post published successfully!");
      setNewPostContent("");
      setNewPostImages([]);
      setSelectedFeeling(null);
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

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth("upload videos")) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

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

  // React to post with emoji
  const reactToPost = async (postId: string, emoji: string) => {
    if (!requireAuth("react to posts")) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentReaction = post.reaction;
        const newReactions = { ...post.reactions };

        // Remove previous reaction
        if (currentReaction && newReactions[currentReaction]) {
          newReactions[currentReaction]--;
          if (newReactions[currentReaction] <= 0) {
            delete newReactions[currentReaction];
          }
        }

        // Add new reaction if different
        if (currentReaction !== emoji) {
          newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          return { ...post, reaction: emoji, reactions: newReactions };
        } else {
          return { ...post, reaction: undefined, reactions: newReactions };
        }
      }
      return post;
    }));

    // Update likes_count in database
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
      const newCount = post.reaction === emoji ? totalReactions - 1 : totalReactions + 1;
      
      await supabase
        .from("health_posts")
        .update({ likes_count: Math.max(0, newCount) })
        .eq("id", postId);
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  // React to comment
  const reactToComment = (postId: string, commentId: string, emoji: string) => {
    if (!requireAuth("react to comments")) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              const currentReaction = comment.reaction;
              const newReactions = { ...comment.reactions };

              if (currentReaction && newReactions[currentReaction]) {
                newReactions[currentReaction]--;
                if (newReactions[currentReaction] <= 0) {
                  delete newReactions[currentReaction];
                }
              }

              if (currentReaction !== emoji) {
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                return { ...comment, reaction: emoji, reactions: newReactions };
              } else {
                return { ...comment, reaction: undefined, reactions: newReactions };
              }
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
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: session.user.id,
          author_name: userProfile.full_name,
          content: text,
          status: "approved",
        })
        .select()
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        author: userProfile.full_name,
        authorImage: userProfile.avatar_url || "",
        content: text,
        time: "Just now",
        userId: session.user.id,
        reactions: {},
        replies: [],
      };

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      }));

      setCommentText({ ...commentText, [postId]: "" });

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
      userId: session?.user?.id || "",
      reactions: {},
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, replies: [...comment.replies, newReply] };
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

  // Edit comment
  const handleEditComment = async () => {
    if (!editCommentDialog || !editCommentText.trim()) return;

    try {
      const { error } = await supabase
        .from("post_comments")
        .update({ content: editCommentText })
        .eq("id", editCommentDialog.commentId);

      if (error) throw error;

      setPosts(posts.map(post => {
        if (post.id === editCommentDialog.postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id === editCommentDialog.commentId) {
                return { ...comment, content: editCommentText };
              }
              return comment;
            }),
          };
        }
        return post;
      }));

      toast.success("Comment updated!");
      setEditCommentDialog(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to update comment");
    }
  };

  // Delete comment
  const handleDeleteComment = async () => {
    if (!deleteCommentDialog) return;

    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", deleteCommentDialog.commentId);

      if (error) throw error;

      setPosts(posts.map(post => {
        if (post.id === deleteCommentDialog.postId) {
          return {
            ...post,
            comments: post.comments.filter(c => c.id !== deleteCommentDialog.commentId),
          };
        }
        return post;
      }));

      // Update comments count
      const post = posts.find(p => p.id === deleteCommentDialog.postId);
      if (post) {
        await supabase
          .from("health_posts")
          .update({ comments_count: Math.max(0, post.comments.length - 1) })
          .eq("id", deleteCommentDialog.postId);
      }

      toast.success("Comment deleted!");
      setDeleteCommentDialog(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Share post with thoughts
  const openShareDialog = (post: Post) => {
    if (!requireAuth("share posts")) return;
    setSharePostData(post);
    setShareThoughts("");
    setShareDialogOpen(true);
  };

  const handleSharePost = async () => {
    if (!sharePost || !session?.user || !userProfile) return;

    setSharing(true);
    try {
      const originalPostData = JSON.stringify({
        id: sharePost.id,
        author: sharePost.author,
        authorImage: sharePost.authorImage,
        content: sharePost.content.substring(0, 200),
      });

      const content = `[reshare:${originalPostData}] ${shareThoughts}`;

      const { error } = await supabase
        .from("health_posts")
        .insert({
          user_id: session.user.id,
          author_name: userProfile.full_name,
          author_avatar: userProfile.avatar_url,
          content: content,
          category: sharePost.category,
          status: "approved",
        });

      if (error) throw error;

      toast.success("Post shared successfully!");
      setShareDialogOpen(false);
      setSharePostData(null);
      setShareThoughts("");
      fetchPosts();
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    } finally {
      setSharing(false);
    }
  };

  const copyPostLink = async (postId: string) => {
    const url = `${window.location.origin}/health-feed/${postId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const currentUserImage = userProfile?.avatar_url || "";
  const currentUserName = userProfile?.full_name || "User";

  const _reactionType: ReactionType = "like"; // Type reference to prevent unused warning

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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add your thoughts..."
              value={shareThoughts}
              onChange={(e) => setShareThoughts(e.target.value)}
              className="min-h-[80px]"
            />
            {sharePost && (
              <div className="border border-border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={sharePost.authorImage} />
                    <AvatarFallback>{sharePost.author[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{sharePost.author}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sharePost.content}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSharePost} disabled={sharing}>
              {sharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Repeat2 className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={!!editCommentDialog} onOpenChange={() => setEditCommentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCommentDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditComment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Dialog */}
      <AlertDialog open={!!deleteCommentDialog} onOpenChange={() => setDeleteCommentDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-8">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Medical Community
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
                  
                  {newPostImages.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {newPostImages.map((media, index) => (
                        <div key={index} className="relative">
                          {media.includes(".mp4") || media.includes(".webm") || media.includes(".mov") ? (
                            <video src={media} className="w-24 h-24 object-cover rounded-lg" />
                          ) : (
                            <img src={media} alt="Upload preview" className="w-24 h-24 object-cover rounded-lg" />
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

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="w-5 h-5 mr-1 animate-spin" /> : <Image className="w-5 h-5 mr-1" />}
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
                            className={`text-muted-foreground hover:text-primary ${selectedFeeling ? "text-primary" : ""}`}
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
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.authorImage} />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        {post.authorRole.includes("Verified Doctor") && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{post.author}</h3>
                          {post.authorRole.includes("Verified Doctor") && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified Doctor
                            </span>
                          )}
                          {post.feeling && (
                            <span className="text-sm text-muted-foreground">is feeling {post.feeling}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {post.authorRole.includes("Verified Doctor") ? (
                            <span className="text-primary/80">{post.authorRole.split("•")[1]?.trim() || "Healthcare Professional"}</span>
                          ) : (
                            <span>{post.authorRole}</span>
                          )}
                          <span>•</span>
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
                        <DropdownMenuItem onClick={() => copyPostLink(post.id)}>Copy link</DropdownMenuItem>
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

                  {/* Reshared Post */}
                  {post.originalPost && (
                    <div className="mt-3 border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.originalPost.authorImage} />
                          <AvatarFallback>{post.originalPost.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.originalPost.author}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.originalPost.content}</p>
                    </div>
                  )}
                </div>

                {/* Post Images/Videos */}
                {post.images.length > 0 && (
                  <div className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-0.5`}>
                    {post.images.map((media, imgIndex) => (
                      media.includes(".mp4") || media.includes(".webm") || media.includes(".mov") ? (
                        <video key={imgIndex} src={media} controls className="w-full h-64 object-cover" />
                      ) : (
                        <img key={imgIndex} src={media} alt={`Post image ${imgIndex + 1}`} className="w-full h-64 object-cover" />
                      )
                    ))}
                  </div>
                )}

                {/* Engagement Stats - Reddit Style */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className={`w-4 h-4 ${post.reactions["like"] ? "text-primary" : ""}`} />
                      <span>{post.reactions["like"] || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className={`w-4 h-4 ${post.reactions["dislike"] ? "text-destructive" : ""}`} />
                      <span>{post.reactions["dislike"] || 0}</span>
                    </div>
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

                {/* Action Buttons - Reddit Style Like/Dislike */}
                <div className="px-4 py-1 flex items-center justify-around border-b border-border">
                  <Button
                    variant="ghost"
                    className={`flex-1 gap-2 ${post.reaction === "like" ? "text-primary" : "text-muted-foreground"}`}
                    onClick={() => reactToPost(post.id, "like")}
                  >
                    <ThumbsUp className={`w-5 h-5 ${post.reaction === "like" ? "fill-current" : ""}`} />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex-1 gap-2 ${post.reaction === "dislike" ? "text-destructive" : "text-muted-foreground"}`}
                    onClick={() => reactToPost(post.id, "dislike")}
                  >
                    <ThumbsDown className={`w-5 h-5 ${post.reaction === "dislike" ? "fill-current" : ""}`} />
                    Dislike
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
                    onClick={() => openShareDialog(post)}
                  >
                    <Repeat2 className="w-5 h-5" />
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
                                <div className="bg-muted rounded-2xl px-3 py-2 relative group">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm text-foreground">{comment.author}</p>
                                    {session?.user?.id === comment.userId && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditCommentDialog({
                                                postId: post.id,
                                                commentId: comment.id,
                                                content: comment.content,
                                              });
                                              setEditCommentText(comment.content);
                                            }}
                                          >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => setDeleteCommentDialog({
                                              postId: post.id,
                                              commentId: comment.id,
                                            })}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-2 text-xs">
                                  <button
                                    onClick={() => reactToComment(post.id, comment.id, "like")}
                                    className={`font-semibold hover:underline flex items-center gap-1 ${
                                      comment.reaction === "like" ? "text-primary" : "text-muted-foreground"
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${comment.reaction === "like" ? "fill-current" : ""}`} />
                                    {comment.reactions["like"] || 0}
                                  </button>
                                  <button
                                    onClick={() => reactToComment(post.id, comment.id, "dislike")}
                                    className={`font-semibold hover:underline flex items-center gap-1 ${
                                      comment.reaction === "dislike" ? "text-destructive" : "text-muted-foreground"
                                    }`}
                                  >
                                    <ThumbsDown className={`w-3 h-3 ${comment.reaction === "dislike" ? "fill-current" : ""}`} />
                                    {comment.reactions["dislike"] || 0}
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
