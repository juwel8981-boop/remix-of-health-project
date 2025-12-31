import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  Heart, MessageCircle, Share2, Clock, Calendar, ArrowLeft,
  Send, ThumbsUp, Reply, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

const articleData: Record<string, any> = {
  "1": {
    id: 1,
    title: "10 Ways to Improve Your Heart Health Naturally",
    content: `
      <p>Heart disease remains one of the leading causes of death worldwide, but the good news is that many risk factors are within your control. By making simple lifestyle changes, you can significantly reduce your risk and improve your overall cardiovascular health.</p>

      <h2>1. Eat a Heart-Healthy Diet</h2>
      <p>Focus on fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, and sodium. The Mediterranean diet is particularly beneficial for heart health.</p>

      <h2>2. Exercise Regularly</h2>
      <p>Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week. Even a 30-minute daily walk can make a significant difference.</p>

      <h2>3. Maintain a Healthy Weight</h2>
      <p>Excess weight puts strain on your heart. Work with your healthcare provider to determine a healthy weight for you and create a sustainable plan to achieve it.</p>

      <h2>4. Quit Smoking</h2>
      <p>Smoking is one of the worst things you can do for your heart. Quitting smoking can reduce your risk of heart disease by 50% within just one year.</p>

      <h2>5. Manage Stress</h2>
      <p>Chronic stress can contribute to heart disease. Practice relaxation techniques like meditation, deep breathing, or yoga to keep stress levels in check.</p>

      <h2>6. Get Enough Sleep</h2>
      <p>Adults need 7-9 hours of quality sleep per night. Poor sleep is linked to higher risk of heart disease, high blood pressure, and obesity.</p>

      <h2>7. Limit Alcohol</h2>
      <p>If you drink alcohol, do so in moderation. For most adults, this means up to one drink per day for women and up to two drinks per day for men.</p>

      <h2>8. Control Blood Pressure</h2>
      <p>High blood pressure is a major risk factor for heart disease. Monitor your blood pressure regularly and work with your doctor to keep it under control.</p>

      <h2>9. Manage Cholesterol</h2>
      <p>High cholesterol can lead to plaque buildup in your arteries. Have your cholesterol checked regularly and follow your doctor's recommendations.</p>

      <h2>10. Stay Connected</h2>
      <p>Social connections are important for heart health. Loneliness and social isolation are linked to increased risk of heart disease.</p>

      <h2>Conclusion</h2>
      <p>Small changes can add up to big improvements in your heart health. Start with one or two changes and gradually add more as they become habits. Your heart will thank you!</p>
    `,
    author: "Dr. Sarah Ahmed",
    authorRole: "Cardiologist",
    authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    category: "Heart Health",
    readTime: "5 min read",
    likes: 234,
    comments: 45,
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=600&fit=crop",
    date: "2024-01-15",
  },
};

const commentsData = [
  {
    id: 1,
    user: "Rahim Uddin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "This is really helpful! I've been trying to improve my heart health and these tips are practical and easy to follow.",
    date: "2024-01-16",
    likes: 12,
    replies: [
      {
        id: 11,
        user: "Dr. Sarah Ahmed",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        comment: "Thank you for the kind words! Start small and build up gradually. Let me know if you have any questions.",
        date: "2024-01-16",
        likes: 5,
        isAuthor: true,
      },
    ],
  },
  {
    id: 2,
    user: "Fatima Begum",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    comment: "I didn't know that social connections could affect heart health! Very informative article.",
    date: "2024-01-17",
    likes: 8,
    replies: [],
  },
  {
    id: 3,
    user: "Kamal Hossain",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    comment: "After following these tips for a month, my blood pressure has improved significantly. Thank you Dr. Ahmed!",
    date: "2024-01-18",
    likes: 15,
    replies: [],
  },
];

export default function ArticleDetail() {
  const { id } = useParams();
  const article = articleData[id || "1"];
  const [comments, setComments] = useState(commentsData);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Button asChild variant="healthcare">
            <Link to="/articles">Browse All Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: [],
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleAddReply = (commentId: number) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: Date.now(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      comment: replyText,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      isAuthor: false,
    };

    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, reply] }
        : c
    ));
    setReplyTo(null);
    setReplyText("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <section className="relative h-64 md:h-96">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <Link
          to="/articles"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </section>

      {/* Content */}
      <section className="healthcare-section -mt-20 relative z-10">
        <div className="healthcare-container max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="healthcare-card"
          >
            {/* Category */}
            <span className="healthcare-badge mb-4">{article.category}</span>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={article.authorImage}
                  alt={article.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{article.author}</p>
                  <p className="text-sm text-muted-foreground">{article.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-display prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:mb-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    liked ? "bg-healthcare-red-light text-healthcare-red" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-healthcare-red" : ""}`} />
                  <span>{liked ? article.likes + 1 : article.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="healthcare-card mt-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            <div className="flex gap-3 mb-8">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button variant="healthcare" size="sm" onClick={handleAddComment}>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{comment.user}</span>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-muted-foreground mb-2">{comment.comment}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          {comment.likes}
                        </button>
                        <button 
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyTo === comment.id && (
                        <div className="mt-4 flex gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                                Cancel
                              </Button>
                              <Button variant="healthcare" size="sm" onClick={() => handleAddReply(comment.id)}>
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-12 space-y-4 border-l-2 border-border pl-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                          <img
                            src={reply.avatar}
                            alt={reply.user}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{reply.user}</span>
                              {reply.isAuthor && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Author</span>
                              )}
                              <span className="text-xs text-muted-foreground">{reply.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{reply.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
