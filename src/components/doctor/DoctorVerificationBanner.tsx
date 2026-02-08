import { motion } from "framer-motion";
import { Clock, XCircle, CheckCircle2 } from "lucide-react";

interface DoctorVerificationBannerProps {
  verificationStatus: string;
  rejectionReason?: string | null;
}

export function DoctorVerificationBanner({ 
  verificationStatus, 
  rejectionReason 
}: DoctorVerificationBannerProps) {
  if (verificationStatus === "pending") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">Verification Pending</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Your account is currently under review. You'll have full access to all features once an admin approves your registration. This usually takes 1-2 business days.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (verificationStatus === "rejected") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Verification Rejected</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Your registration was not approved.
              {rejectionReason && (
                <span className="block mt-2 font-medium">
                  Reason: {rejectionReason}
                </span>
              )}
            </p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-2">
              Please contact support if you believe this is an error or to submit updated documentation.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (verificationStatus === "approved") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">Verified Doctor</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Your account is verified. You have full access to all doctor features.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
