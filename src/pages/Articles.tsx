import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Heart, MessageCircle, Share2, Clock, User, TrendingUp, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

const articles = [
  {
    id: 1,
    title: "10 Ways to Improve Your Heart Health Naturally",
    excerpt: "Discover simple lifestyle changes that can significantly reduce your risk of heart disease and improve cardiovascular health.",
    author: "Dr. Sarah Ahmed",
    authorRole: "Cardiologist",
    authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    category: "Heart Health",
    readTime: "5 min read",
    likes: 234,
    comments: 45,
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&h=400&fit=crop",
    featured: true,
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Understanding Anxiety: Signs, Symptoms, and Solutions",
    excerpt: "Learn to recognize anxiety symptoms and discover effective strategies to manage stress in your daily life.",
    author: "Dr. Nasreen Akter",
    authorRole: "Psychiatrist",
    authorImage: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face",
    category: "Mental Health",
    readTime: "7 min read",
    likes: 189,
    comments: 32,
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop",
    featured: true,
    date: "2024-01-12",
  },
  {
    id: 3,
    title: "The Complete Guide to Balanced Nutrition",
    excerpt: "Everything you need to know about maintaining a healthy diet that provides all essential nutrients.",
    author: "Dr. Kamal Hossain",
    authorRole: "Nutritionist",
    authorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face",
    category: "Nutrition",
    readTime: "8 min read",
    likes: 156,
    comments: 28,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    featured: false,
    date: "2024-01-10",
  },
  {
    id: 4,
    title: "Childhood Vaccinations: A Parent's Complete Guide",
    excerpt: "Understanding the importance of immunizations and the recommended vaccination schedule for children.",
    author: "Dr. Fatima Khan",
    authorRole: "Pediatrician",
    authorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    category: "Child Care",
    readTime: "6 min read",
    likes: 198,
    comments: 52,
    image: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&h=400&fit=crop",
    featured: false,
    date: "2024-01-08",
  },
  {
    id: 5,
    title: "Managing Type 2 Diabetes Through Lifestyle Changes",
    excerpt: "Practical tips and strategies for controlling blood sugar levels naturally through diet and exercise.",
    author: "Dr. Mohammad Rahman",
    authorRole: "Endocrinologist",
    authorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    category: "Diabetes",
    readTime: "10 min read",
    likes: 267,
    comments: 41,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
    featured: false,
    date: "2024-01-05",
  },
  {
    id: 6,
    title: "Home Workouts That Actually Work",
    excerpt: "Effective exercise routines you can do at home without any equipment to stay fit and healthy.",
    author: "Dr. Aminul Islam",
    authorRole: "Sports Medicine",
    authorImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
    category: "Fitness",
    readTime: "5 min read",
    likes: 312,
    comments: 67,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    featured: false,
    date: "2024-01-03",
  },
];

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const featuredArticles = articles.filter((a) => a.featured);
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Health Articles & Tips
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Expert-written articles to help you stay informed and healthy
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-card sticky top-16 md:top-20 z-40">
        <div className="healthcare-container">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
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

      {/* Featured Articles */}
      {selectedCategory === "All" && searchQuery === "" && (
        <section className="healthcare-section bg-muted">
          <div className="healthcare-container">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold text-foreground">Featured Articles</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="healthcare-card overflow-hidden group"
                >
                  <Link to={`/articles/${article.id}`}>
                    <div className="relative h-56 -m-6 mb-4 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-4 left-4 healthcare-badge">
                        {article.category}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.authorImage}
                          alt={article.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{article.author}</p>
                          <p className="text-xs text-muted-foreground">{article.authorRole}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {selectedCategory === "All" ? "Latest Articles" : selectedCategory}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="healthcare-card overflow-hidden group"
              >
                <Link to={`/articles/${article.id}`}>
                  <div className="relative h-40 -m-6 mb-4 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <img
                        src={article.authorImage}
                        alt={article.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-foreground">{article.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-3 h-3" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
