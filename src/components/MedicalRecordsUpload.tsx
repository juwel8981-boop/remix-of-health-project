import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Image, File, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicalRecordsUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

const recordTypes = [
  { id: "lab", name: "Lab Report", icon: FileText },
  { id: "prescription", name: "Prescription", icon: FileText },
  { id: "imaging", name: "X-Ray/MRI/CT", icon: Image },
  { id: "discharge", name: "Discharge Summary", icon: File },
  { id: "other", name: "Other", icon: File },
];

export function MedicalRecordsUpload({ isOpen, onClose }: MedicalRecordsUploadProps) {
  const [selectedType, setSelectedType] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [doctorName, setDoctorName] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || files.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    setUploadSuccess(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setUploadSuccess(false);
      setSelectedType("");
      setFiles([]);
      setDoctorName("");
      setRecordDate("");
      setNotes("");
      onClose();
    }, 2000);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-card rounded-2xl shadow-healthcare-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Upload Medical Record
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          {uploadSuccess ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-healthcare-green-light flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-healthcare-green" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Successful!</h3>
              <p className="text-muted-foreground">Your medical record has been saved securely.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Record Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Record Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recordTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <type.icon className={`w-4 h-4 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm ${selectedType === type.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {type.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Upload Files *
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium mb-1">Click to upload files</p>
                    <p className="text-sm text-muted-foreground">PDF, JPG, PNG, DOC (max 10MB each)</p>
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-full hover:bg-border transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g., Dr. Sarah Ahmed"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Record Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Record Date
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this record..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Your medical records are encrypted and stored securely. Only you can access them unless you choose to share with a doctor.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="healthcare" 
                  className="flex-1"
                  disabled={!selectedType || files.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Record
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
