import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, Upload, FileText, Image, File, Trash2, Download, 
  Calendar, User, Loader2, Search, Filter, HardDrive
} from "lucide-react";
import { EHRUpload } from "@/components/EHRUpload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EHRRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  record_type: string;
  doctor_name: string | null;
  record_date: string | null;
  notes: string | null;
  created_at: string;
}

const recordTypeLabels: Record<string, string> = {
  lab: "Lab Report",
  prescription: "Prescription",
  imaging: "X-Ray/MRI/CT",
  discharge: "Discharge Summary",
  other: "Other",
};

const recordTypeIcons: Record<string, typeof FileText> = {
  lab: FileText,
  prescription: FileText,
  imaging: Image,
  discharge: File,
  other: File,
};

const MAX_STORAGE = 100 * 1024 * 1024; // 100MB

export default function PatientEHR() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<EHRRecord[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("ehr_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setRecords(data);
      const totalSize = data.reduce((acc, r) => acc + (r.file_size || 0), 0);
      setTotalStorageUsed(totalSize);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    const record = records.find(r => r.id === deleteId);
    
    if (record) {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("ehr-records")
        .remove([record.file_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("ehr_records")
        .delete()
        .eq("id", deleteId);

      if (dbError) {
        toast.error("Failed to delete record");
      } else {
        toast.success("Record deleted successfully");
        fetchRecords();
      }
    }

    setDeleting(false);
    setDeleteId(null);
  };

  const handleDownload = async (record: EHRRecord) => {
    const { data, error } = await supabase.storage
      .from("ehr-records")
      .download(record.file_path);

    if (error) {
      toast.error("Failed to download file");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = record.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || record.record_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const storagePercentage = (totalStorageUsed / MAX_STORAGE) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/patient")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Electronic Health Records (EHR)
                </h1>
                <p className="text-muted-foreground">Manage your medical documents securely</p>
              </div>
            </div>
            <Button variant="healthcare" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Record
            </Button>
          </div>

          {/* Storage Usage Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <HardDrive className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-foreground">Storage Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(totalStorageUsed)} of {formatBytes(MAX_STORAGE)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        storagePercentage > 90 ? "bg-destructive" : 
                        storagePercentage > 70 ? "bg-yellow-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(MAX_STORAGE - totalStorageUsed)} remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab">Lab Reports</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="imaging">X-Ray/MRI/CT</SelectItem>
                <SelectItem value="discharge">Discharge Summary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records List */}
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Records Found</h3>
                <p className="text-muted-foreground mb-4">
                  {records.length === 0 
                    ? "Upload your first EHR record to get started"
                    : "No records match your search criteria"}
                </p>
                {records.length === 0 && (
                  <Button variant="healthcare" onClick={() => setShowUploadModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Record
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const Icon = recordTypeIcons[record.record_type] || File;
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-medium text-foreground truncate">
                                  {record.file_name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {recordTypeLabels[record.record_type] || record.record_type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatBytes(record.file_size)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(record)}
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(record.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {record.doctor_name && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" />
                                  {record.doctor_name}
                                </div>
                              )}
                              {record.record_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(record.record_date)}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Uploaded {formatDate(record.created_at)}
                              </div>
                            </div>
                            {record.notes && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {record.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload Modal */}
      <EHRUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchRecords}
        currentStorageUsed={totalStorageUsed}
        maxStorage={MAX_STORAGE}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
