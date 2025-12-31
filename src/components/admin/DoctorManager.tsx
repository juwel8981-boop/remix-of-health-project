import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, 
  Filter, ChevronDown, Save, X, Star, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  area: string;
  rating: number;
  reviews: number;
  verified: boolean;
  experience: string;
  fee: string;
  available: boolean;
  image: string;
  status: "approved" | "pending" | "rejected";
}

const specialties = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
];

const areas = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];

const initialDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Fazle Rabbi Chowdhury",
    specialty: "Cardiologist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.9,
    reviews: 234,
    verified: true,
    experience: "22 years",
    fee: "৳2,500",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    status: "approved",
  },
  {
    id: 2,
    name: "Dr. Mir Jamal Uddin",
    specialty: "Cardiologist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 189,
    verified: true,
    experience: "18 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    status: "approved",
  },
  {
    id: 3,
    name: "Dr. Aminul Islam",
    specialty: "Dermatologist",
    hospital: "Labaid Hospital",
    area: "Dhaka",
    rating: 4.5,
    reviews: 98,
    verified: false,
    experience: "10 years",
    fee: "৳1,200",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    status: "pending",
  },
  {
    id: 4,
    name: "Dr. Rubina Akter",
    specialty: "Gynecologist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.7,
    reviews: 156,
    verified: true,
    experience: "15 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
    status: "approved",
  },
];

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({});

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || doctor.specialty === filterSpecialty;
    const matchesStatus = filterStatus === "all" || doctor.status === filterStatus;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({ ...doctor });
  };

  const handleAddDoctor = () => {
    setIsAddingDoctor(true);
    setDoctorForm({
      name: "",
      specialty: "",
      hospital: "",
      area: "",
      rating: 0,
      reviews: 0,
      verified: false,
      experience: "",
      fee: "",
      available: true,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
      status: "pending",
    });
  };

  const handleSaveDoctor = () => {
    if (editingDoctor) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === editingDoctor.id ? { ...d, ...doctorForm } as Doctor : d))
      );
      setEditingDoctor(null);
    } else if (isAddingDoctor) {
      const newDoctor: Doctor = {
        id: Date.now(),
        name: doctorForm.name || "",
        specialty: doctorForm.specialty || "",
        hospital: doctorForm.hospital || "",
        area: doctorForm.area || "",
        rating: doctorForm.rating || 0,
        reviews: doctorForm.reviews || 0,
        verified: doctorForm.verified ?? false,
        experience: doctorForm.experience || "",
        fee: doctorForm.fee || "",
        available: doctorForm.available ?? true,
        image: doctorForm.image || "",
        status: doctorForm.status || "pending",
      };
      setDoctors((prev) => [newDoctor, ...prev]);
      setIsAddingDoctor(false);
    }
    setDoctorForm({});
  };

  const handleDeleteDoctor = (id: number) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const handleStatusChange = (id: number, status: "approved" | "pending" | "rejected") => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status, verified: status === "approved" }
          : d
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Doctor Management</h2>
          <p className="text-muted-foreground">Manage all registered doctors and their information</p>
        </div>
        <Button variant="healthcare" onClick={handleAddDoctor}>
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Doctors Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Specialty</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Hospital</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <motion.tr
                  key={doctor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.experience}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground">{doctor.specialty}</td>
                  <td className="py-4 px-4 text-muted-foreground">{doctor.hospital}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-medium text-foreground">{doctor.rating}</span>
                      <span className="text-muted-foreground">({doctor.reviews})</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.status === "approved"
                          ? "bg-healthcare-green-light text-healthcare-green"
                          : doctor.status === "pending"
                          ? "bg-healthcare-orange-light text-accent"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      {doctor.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-healthcare-green"
                            onClick={() => handleStatusChange(doctor.id, "approved")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleStatusChange(doctor.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit/Add Doctor Dialog */}
      <Dialog
        open={editingDoctor !== null || isAddingDoctor}
        onOpenChange={() => {
          setEditingDoctor(null);
          setIsAddingDoctor(false);
          setDoctorForm({});
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={doctorForm.name || ""}
                onChange={(e) => setDoctorForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. Full Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Specialty</Label>
                <Select
                  value={doctorForm.specialty || ""}
                  onValueChange={(value) => setDoctorForm((prev) => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Area</Label>
                <Select
                  value={doctorForm.area || ""}
                  onValueChange={(value) => setDoctorForm((prev) => ({ ...prev, area: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Hospital/Clinic</Label>
              <Input
                value={doctorForm.hospital || ""}
                onChange={(e) => setDoctorForm((prev) => ({ ...prev, hospital: e.target.value }))}
                placeholder="Primary hospital or clinic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Experience</Label>
                <Input
                  value={doctorForm.experience || ""}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 15 years"
                />
              </div>
              <div>
                <Label>Consultation Fee</Label>
                <Input
                  value={doctorForm.fee || ""}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, fee: e.target.value }))}
                  placeholder="e.g., ৳1,500"
                />
              </div>
            </div>

            <div>
              <Label>Profile Image URL</Label>
              <Input
                value={doctorForm.image || ""}
                onChange={(e) => setDoctorForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="verified"
                  checked={doctorForm.verified ?? false}
                  onCheckedChange={(checked) =>
                    setDoctorForm((prev) => ({ ...prev, verified: checked === true }))
                  }
                />
                <Label htmlFor="verified" className="cursor-pointer">Verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="available"
                  checked={doctorForm.available ?? true}
                  onCheckedChange={(checked) =>
                    setDoctorForm((prev) => ({ ...prev, available: checked === true }))
                  }
                />
                <Label htmlFor="available" className="cursor-pointer">Available</Label>
              </div>
            </div>

            {editingDoctor && (
              <div>
                <Label>Status</Label>
                <Select
                  value={doctorForm.status || "pending"}
                  onValueChange={(value) =>
                    setDoctorForm((prev) => ({ ...prev, status: value as Doctor["status"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDoctor(null);
                setIsAddingDoctor(false);
                setDoctorForm({});
              }}
            >
              Cancel
            </Button>
            <Button variant="healthcare" onClick={handleSaveDoctor}>
              <Save className="w-4 h-4 mr-2" />
              Save Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
