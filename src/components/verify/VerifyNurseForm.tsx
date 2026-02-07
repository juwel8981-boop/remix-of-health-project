import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Shield, AlertCircle, User, Building2, GraduationCap, Calendar, HeartPulse, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockNurseData = {
  "BNMC-11111": {
    name: "Fatima Begum",
    registrationNumber: "BNMC-11111",
    designation: "Registered Nurse",
    qualification: "BSc in Nursing",
    institution: "National Institute of Nursing Education & Research",
    registrationDate: "2015-03-20",
    status: "active",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  "BNMC-22222": {
    name: "Rashida Akter",
    registrationNumber: "BNMC-22222",
    designation: "Senior Staff Nurse",
    qualification: "Diploma in Nursing Science & Midwifery",
    institution: "Dhaka Nursing College",
    registrationDate: "2018-07-10",
    status: "active",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face",
  },
};

export default function VerifyNurseForm() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setSearched(false);

    // Simulate API call
    setTimeout(() => {
      const result = mockNurseData[registrationNumber.toUpperCase() as keyof typeof mockNurseData];
      setSearchResult(result || null);
      setIsSearching(false);
      setSearched(true);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg shadow-secondary/20">
          <HeartPulse className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Verify Nurse</h2>
          <p className="text-sm text-muted-foreground">Bangladesh Nursing & Midwifery Council (BNMC)</p>
        </div>
      </div>

      <div className="healthcare-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Enter Registration Number
        </h3>
        <p className="text-muted-foreground mb-6">
          Enter the nurse's BNMC registration number to verify their credentials.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g., BNMC-11111"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSearch}
            disabled={!registrationNumber.trim() || isSearching}
            className="gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
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
              <p>Try: <code className="bg-background px-2 py-0.5 rounded">BNMC-11111</code> or <code className="bg-background px-2 py-0.5 rounded">BNMC-22222</code></p>
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
                    Verified Nurse
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This nurse is registered with BNMC
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
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Designation</p>
                      <p className="font-semibold text-foreground">{searchResult.designation}</p>
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
                    Nurse Not Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No nurse found with the registration number "{registrationNumber}".
                    Please check the number and try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
