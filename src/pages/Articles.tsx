import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Send, Image, X, MoreHorizontal,
  ThumbsUp, Smile, Camera, Video, MapPin, Users, Globe, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  authorImage: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
}

interface Post {
  id: number;
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
];

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Dr. Sarah Ahmed",
    authorRole: "Cardiologist",
    authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    content: "🫀 10 Ways to Improve Your Heart Health Naturally\n\nDiscover simple lifestyle changes that can significantly reduce your risk of heart disease:\n\n1. Exercise regularly (at least 30 mins/day)\n2. Eat a heart-healthy diet\n3. Maintain a healthy weight\n4. Quit smoking\n5. Limit alcohol consumption\n\nRemember, small changes lead to big results! What's your favorite heart-healthy habit?",
    images: ["https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=500&fit=crop"],
    category: "Heart Health",
    time: "2 hours ago",
    likes: 234,
    liked: false,
    shares: 45,
    comments: [
      {
        id: 1,
        author: "Rahim Ahmed",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        content: "Great tips! I started walking 30 minutes daily and my blood pressure has improved significantly.",
        time: "1 hour ago",
        likes: 12,
        liked: false,
        replies: [
          {
            id: 1,
            author: "Dr. Sarah Ahmed",
            authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
            content: "That's wonderful to hear! Consistency is key. Keep up the great work! 💪",
            time: "45 mins ago",
            likes: 5,
            liked: false,
          }
        ]
      },
      {
        id: 2,
        author: "Fatima Begum",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        content: "Can you recommend some specific heart-healthy foods?",
        time: "30 mins ago",
        likes: 8,
        liked: false,
        replies: []
      }
    ],
  },
  {
    id: 2,
    author: "Dr. Nasreen Akter",
    authorRole: "Psychiatrist",
    authorImage: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face",
    content: "🧠 Understanding Anxiety: You're Not Alone\n\nAnxiety affects millions of people worldwide. If you're feeling overwhelmed, here are some immediate coping strategies:\n\n• Practice deep breathing (4-7-8 technique)\n• Ground yourself with the 5-4-3-2-1 method\n• Talk to someone you trust\n• Limit caffeine and sugar\n• Get adequate sleep\n\nRemember: Seeking help is a sign of strength, not weakness. 💙",
    images: ["https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=500&fit=crop"],
    category: "Mental Health",
    time: "5 hours ago",
    likes: 189,
    liked: false,
    shares: 78,
    comments: [
      {
        id: 1,
        author: "Karim Hassan",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        content: "The 5-4-3-2-1 grounding technique has been life-changing for me. Thank you for spreading awareness!",
        time: "4 hours ago",
        likes: 23,
        liked: false,
        replies: []
      }
    ],
  },
  {
    id: 3,
    author: "Dr. Kamal Hossain",
    authorRole: "Nutritionist",
    authorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face",
    content: "🥗 Quick Healthy Meal Prep Ideas!\n\nBusy week ahead? Here are 5 nutritious meals you can prep in under 30 minutes:\n\n1. Overnight oats with fruits\n2. Grilled chicken with roasted vegetables\n3. Lentil soup with whole grain bread\n4. Quinoa salad with chickpeas\n5. Stir-fried tofu with brown rice\n\nShare your favorite healthy meal prep ideas below! 👇",
    images: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop"
    ],
    category: "Nutrition",
    time: "1 day ago",
    likes: 156,
    liked: false,
    shares: 34,
    comments: [],
  },
  {
    id: 4,
    author: "Dr. Fatima Khan",
    authorRole: "Pediatrician",
    authorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    content: "👶 Vaccination Schedule Reminder for Parents!\n\nKeeping your child's vaccinations up to date is crucial for their health and the community. Don't skip or delay scheduled vaccines!\n\nIf you have any concerns about vaccines, please consult with your pediatrician. We're here to answer all your questions with evidence-based information.\n\n#ChildHealth #Vaccination #HealthyKids",
    images: [],
    category: "Child Care",
    time: "2 days ago",
    likes: 198,
    liked: false,
    shares: 89,
    comments: [
      {
        id: 1,
        author: "Nusrat Jahan",
        authorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        content: "My baby just completed her 6-month vaccines. So relieved! Thank you for the reminder, Doctor.",
        time: "1 day ago",
        likes: 15,
        liked: false,
        replies: []
      }
    ],
  },
];

const currentUser = {
  name: "You",
  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
};

export default function Articles() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [replyTo, setReplyTo] = useState<{ postId: number; commentId: number } | null>(null);
  const [replyText, setReplyText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = posts.filter((post) => {
    return selectedCategory === "All" || post.category === selectedCategory;
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim() && newPostImages.length === 0) return;

    const newPost: Post = {
      id: Date.now(),
      author: currentUser.name,
      authorRole: "Community Member",
      authorImage: currentUser.image,
      content: newPostContent,
      images: newPostImages,
      category: "General",
      time: "Just now",
      likes: 0,
      liked: false,
      shares: 0,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setNewPostImages([]);
  };

  const handleImageUpload = () => {
    // Simulate image upload with sample images
    const sampleImages = [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=500&fit=crop",
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setNewPostImages([...newPostImages, randomImage]);
  };

  const removeImage = (index: number) => {
    setNewPostImages(newPostImages.filter((_, i) => i !== index));
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  const toggleCommentLike = (postId: number, commentId: number) => {
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

  const addComment = (postId: number) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: currentUser.name,
      authorImage: currentUser.image,
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
  };

  const addReply = (postId: number, commentId: number) => {
    if (!replyText.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      author: currentUser.name,
      authorImage: currentUser.image,
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

  const sharePost = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    // Could add toast notification here
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-sm border border-border p-4"
          >
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.image} />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share a health tip, ask a question, or start a discussion..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                />
                
                {/* Image Preview */}
                {newPostImages.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {newPostImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt="Upload preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
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
                      onClick={handleImageUpload}
                    >
                      <Image className="w-5 h-5 mr-1" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Video className="w-5 h-5 mr-1" />
                      Video
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hidden sm:flex"
                    >
                      <Smile className="w-5 h-5 mr-1" />
                      Feeling
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() && newPostImages.length === 0}
                    size="sm"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{post.author}</h3>
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

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-0.5`}>
                    {post.images.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img}
                        alt={`Post image ${imgIndex + 1}`}
                        className="w-full h-64 object-cover"
                      />
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
                            <AvatarImage src={currentUser.image} />
                            <AvatarFallback>You</AvatarFallback>
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
                                      <AvatarImage src={currentUser.image} />
                                      <AvatarFallback>You</AvatarFallback>
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

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">No posts in this category yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
