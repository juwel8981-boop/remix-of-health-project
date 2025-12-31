import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, User, UserCog, ArrowRight, Heart, Shield, Clock } from "lucide-react";

export default function SignupSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Stethoscope className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Join MedConnect
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Choose how you'd like to use our platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/signup/patient" className="block group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-between">
                    Sign up as Patient
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Find doctors, book appointments, and manage your health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>Access to verified healthcare providers</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Instant account activation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Secure health records storage</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      ✓ Instant Access
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Doctor Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/signup/doctor" className="block group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCog className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-between">
                    Sign up as Doctor
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Register your practice and connect with patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Verified professional profile</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <User className="w-4 h-4 text-primary" />
                      <span>Patient management tools</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Appointment scheduling system</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                      ⏳ Admin Verification Required
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-muted-foreground mt-8"
        >
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
