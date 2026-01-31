import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Shield, AlertCircle, User, Building2, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockDoctorData = {
  "BM&DC-12345": {
    name: "Dr. Sarah Ahmed",
    registrationNumber: "BM&DC-12345",
    specialty: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    institution: "Dhaka Medical College",
    registrationDate: "2010-05-15",
    status: "active",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  "BM&DC-67890": {
    name: "Dr. Mohammad Rahman",
    registrationNumber: "BM&DC-67890",
    specialty: "Neurology",
    qualification: "MBBS, FCPS (Neurology)",
    institution: "Bangabandhu Sheikh Mujib Medical University",
    registrationDate: "2012-08-22",
    status: "active",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
};

export default function VerifyDoctor() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setSearched(false);

    // Simulate API call
    setTimeout(() => {
      const result = mockDoctorData[registrationNumber.toUpperCase() as keyof typeof mockDoctorData];
      setSearchResult(result || null);
      setIsSearching(false);
      setSearched(true);
    }, 1500);
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
              Verify Doctor Credentials
            </h1>
            <p className="text-primary-foreground/80">
              Ensure your doctor is registered with the Bangladesh Medical & Dental Council (BM&DC)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="healthcare-card">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Enter Registration Number
              </h2>
              <p className="text-muted-foreground mb-6">
                Enter the doctor's BM&DC registration number to verify their credentials.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-input bg-background">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g., BM&DC-12345"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground uppercase"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  variant="healthcare"
                  size="lg"
                  onClick={handleSearch}
                  disabled={!registrationNumber.trim() || isSearching}
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-muted">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Demo Registration Numbers:</p>
                    <p>Try: <code className="bg-background px-2 py-0.5 rounded">BM&DC-12345</code> or <code className="bg-background px-2 py-0.5 rounded">BM&DC-67890</code></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                {searchResult ? (
                  <div className="healthcare-card border-2 border-healthcare-green">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                      <div className="w-12 h-12 rounded-full bg-healthcare-green-light flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-healthcare-green" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-healthcare-green">
                          Verified Doctor
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This doctor is registered with BM&DC
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                      <img
                        src={searchResult.image}
                        alt={searchResult.name}
                        className="w-32 h-32 rounded-xl object-cover mx-auto sm:mx-0"
                      />
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-semibold text-foreground">{searchResult.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Registration Number</p>
                            <p className="font-semibold text-foreground">{searchResult.registrationNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Qualification</p>
                            <p className="font-semibold text-foreground">{searchResult.qualification}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Institution</p>
                            <p className="font-semibold text-foreground">{searchResult.institution}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Registration Date</p>
                            <p className="font-semibold text-foreground">
                              {new Date(searchResult.registrationDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <span className="healthcare-badge-success">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Active Registration
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="healthcare-card border-2 border-healthcare-red">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-full bg-healthcare-red-light flex items-center justify-center mx-auto sm:mx-0">
                        <XCircle className="w-6 h-6 text-healthcare-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-healthcare-red">
                          Doctor Not Found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          No doctor found with the registration number "{registrationNumber}".
                          Please check the number and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="healthcare-section bg-muted">
        <div className="healthcare-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
              Why Verify Your Doctor?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Ensure Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  Verify that your doctor has valid credentials and is licensed to practice.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Prevent Fraud</h3>
                <p className="text-sm text-muted-foreground">
                  Protect yourself from unqualified practitioners and medical fraud.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-primary" />
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
