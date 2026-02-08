import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight, Users, Building2, Stethoscope, CheckCircle2, Star, Shield, Clock, Heart, Activity, FileText, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-healthcare.jpg";

// Mock data for featured doctors
const featuredDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    hospital: "Dhaka Medical College",
    rating: 4.9,
    reviews: 124,
    verified: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Mohammad Rahman",
    specialty: "Neurologist",
    hospital: "Square Hospital",
    rating: 4.8,
    reviews: 98,
    verified: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Fatima Khan",
    specialty: "Pediatrician",
    hospital: "Apollo Hospital",
    rating: 4.9,
    reviews: 156,
    verified: true,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
];

const stats = [
  { value: "10,000+", label: "Verified Doctors", icon: Stethoscope },
  { value: "500+", label: "Hospitals", icon: Building2 },
  { value: "1M+", label: "Patients Served", icon: Users },
  { value: "50+", label: "Specialties", icon: Activity },
];

const features = [
  {
    icon: Search,
    title: "Find Nearby Facilities",
    description: "Locate hospitals and diagnostic centers in your area with real-time availability.",
  },
  {
    icon: Shield,
    title: "Verified Doctors",
    description: "All doctors are verified through BMDC registration ensuring authentic credentials.",
  },
  {
    icon: FileText,
    title: "Digital Health Records",
    description: "Store and access your medical reports, prescriptions securely from anywhere.",
  },
  {
    icon: Bell,
    title: "Health Reminders",
    description: "Never miss a medication or appointment with smart health reminders.",
  },
  {
    icon: Activity,
    title: "AI Doctor Finder",
    description: "Describe your symptoms and get intelligent recommendations for specialists.",
  },
  {
    icon: Heart,
    title: "Medical Community",
    description: "Stay informed with community health tips, questions, and expert insights from doctors.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Search & Discover",
    description: "Find doctors, hospitals, or diagnostic centers by location, specialty, or name.",
  },
  {
    step: 2,
    title: "View & Compare",
    description: "Check credentials, reviews, availability, and compare options easily.",
  },
  {
    step: 3,
    title: "Book & Visit",
    description: "Schedule appointments and get directions to your chosen healthcare provider.",
  },
];

const testimonials = [
  {
    name: "Rahim Uddin",
    role: "Patient",
    content: "MediCare helped me find a specialist for my mother within minutes. The verification feature gave us confidence in our choice.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Nasreen Akter",
    role: "General Physician",
    content: "As a doctor, this platform has helped me reach more patients. The dashboard is intuitive and appointment management is seamless.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Kamal Hossain",
    role: "Patient",
    content: "The medical record storage feature is a game-changer. I can access all my reports during any consultation.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

export default function Index() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating orbs for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />

        <div className="healthcare-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6 border border-primary-foreground/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-sm font-medium text-primary-foreground">Trusted by 1M+ users in Bangladesh</span>
              </motion.div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Your Health,{" "}
                <span className="relative">
                  <span className="text-accent">Our Priority</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/50 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Find verified doctors, hospitals, and diagnostic centers near you. Store your medical records securely and get AI-powered health recommendations.
              </motion.p>

              {/* Enhanced Search Box */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl p-2 shadow-healthcare-lg max-w-xl mx-auto lg:mx-0 border border-border/50"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-muted group hover:bg-muted/80 transition-colors">
                    <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search doctors, hospitals..."
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted sm:w-48 group hover:bg-muted/80 transition-colors">
                    <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Location"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button variant="accent" size="lg" className="sm:px-6 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="sm:hidden md:inline">Search</span>
                    </span>
                  </Button>
                </div>
              </motion.div>

              {/* Quick Links with hover effects */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6"
              >
                <Link to="/doctors" className="group text-sm text-primary-foreground/70 hover:text-primary-foreground transition-all flex items-center gap-1 hover:gap-2">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> Find Doctors
                </Link>
                <Link to="/hospitals" className="group text-sm text-primary-foreground/70 hover:text-primary-foreground transition-all flex items-center gap-1 hover:gap-2">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> Nearby Hospitals
                </Link>
                <Link to="/verify-doctor" className="group text-sm text-primary-foreground/70 hover:text-primary-foreground transition-all flex items-center gap-1 hover:gap-2">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> Verify Personnel
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-3xl rotate-3 scale-105" />
                <img
                  src={heroImage}
                  alt="Healthcare professionals providing quality care"
                  className="relative rounded-3xl shadow-2xl"
                />

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-healthcare-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-healthcare-green-light flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-healthcare-green" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">10,000+</p>
                      <p className="text-sm text-muted-foreground">Verified Doctors</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Rating Card */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-healthcare-lg"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="font-bold text-foreground">4.9</span>
                    <span className="text-sm text-muted-foreground">Rating</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="healthcare-section bg-background relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="healthcare-container relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="text-center group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300" />
                </div>
                <p className="text-3xl md:text-4xl font-bold font-display text-foreground mb-1 group-hover:text-primary transition-colors">{stat.value}</p>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="healthcare-section bg-muted">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="healthcare-badge mb-4">Features</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Your Health
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive healthcare platform designed to make your medical journey seamless and secure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="healthcare-card group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">{feature.description}</p>
                
                {/* Hover indicator */}
                <div className="mt-4 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                  Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="healthcare-section bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="healthcare-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="healthcare-badge-accent mb-4">How It Works</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Steps to Better Healthcare
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with MediCare is easy. Follow these simple steps to access quality healthcare.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Animated Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient-x" />
            </div>

            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="text-center relative group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold font-display shadow-healthcare-lg relative z-10 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-110 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="healthcare-section bg-muted relative overflow-hidden">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          >
            <div>
              <span className="healthcare-badge mb-4">Top Doctors</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Healthcare Professionals
              </h2>
              <p className="text-lg text-muted-foreground">
                Trusted and verified doctors ready to help you.
              </p>
            </div>
            <Button variant="healthcare-outline" asChild>
              <Link to="/doctors">
                View All Doctors <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/doctors/${doctor.id}`} className="block healthcare-card">
                  <div className="flex items-start gap-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-foreground truncate">{doctor.name}</h3>
                        {doctor.verified && (
                          <CheckCircle2 className="w-4 h-4 text-healthcare-green flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-primary font-medium mb-1">{doctor.specialty}</p>
                      <p className="text-sm text-muted-foreground truncate">{doctor.hospital}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-semibold text-foreground">{doctor.rating}</span>
                      <span className="text-sm text-muted-foreground">({doctor.reviews} reviews)</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="healthcare-section bg-background">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="healthcare-badge-success mb-4">Testimonials</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from patients and doctors who trust MediCare.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="healthcare-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="healthcare-section bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground">
        <div className="healthcare-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join over a million users who trust MediCare for their healthcare needs. Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/doctors">
                  Find a Doctor
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
