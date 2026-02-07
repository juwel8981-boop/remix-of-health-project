import { motion } from "framer-motion";
import { Shield, Stethoscope, HeartPulse, ExternalLink } from "lucide-react";

const VERIFY_URLS = {
  doctor: "https://verify.bmdc.org.bd/",
  nurse: "https://bncdb.bnmc.gov.bd/admin/lic_num_src/",
};

export default function VerifyDoctor() {
  const handleVerify = (type: "doctor" | "nurse") => {
    window.open(VERIFY_URLS[type], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Verify Personnel Credentials
            </h1>
            <p className="text-primary-foreground/80">
              Verify healthcare professionals through official government portals
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                Select Personnel Type
              </h2>
              <p className="text-muted-foreground">
                Choose the type of healthcare professional you want to verify. You will be redirected to the official government verification portal.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Verify Doctor Card */}
              <motion.button
                onClick={() => handleVerify("doctor")}
                className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                    <Stethoscope className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Verify Doctor
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Verify if a doctor is registered with the Bangladesh Medical & Dental Council (BM&DC)
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                    <span className="font-medium">Official Portal:</span> verify.bmdc.org.bd
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>Open BM&DC Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="absolute -right-2 -bottom-2 w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors" />
              </motion.button>

              {/* Verify Nurse Card */}
              <motion.button
                onClick={() => handleVerify("nurse")}
                className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all duration-300 hover:border-secondary hover:shadow-xl hover:shadow-secondary/10"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-6 shadow-lg shadow-secondary/20 group-hover:shadow-xl group-hover:shadow-secondary/30 transition-shadow">
                    <HeartPulse className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
                    Verify Nurse
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Verify if a nurse is registered with the Bangladesh Nursing & Midwifery Council (BNMC)
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                    <span className="font-medium">Official Portal:</span> bncdb.bnmc.gov.bd
                  </div>
                  
                  <div className="flex items-center gap-2 text-secondary font-medium">
                    <span>Open BNMC Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary/5 group-hover:bg-secondary/10 transition-colors" />
                <div className="absolute -right-2 -bottom-2 w-20 h-20 rounded-full bg-secondary/10 group-hover:bg-secondary/15 transition-colors" />
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Official Government Portals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                <span>Secure Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                <span>Opens in New Tab</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="healthcare-section bg-muted">
        <div className="healthcare-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
              Why Verify Healthcare Personnel?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Ensure Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  Verify that your healthcare provider has valid credentials and is licensed to practice.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Prevent Fraud</h3>
                <p className="text-sm text-muted-foreground">
                  Protect yourself from unqualified practitioners and medical fraud.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <HeartPulse className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Peace of Mind</h3>
                <p className="text-sm text-muted-foreground">
                  Trust your healthcare provider with confidence in their qualifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
