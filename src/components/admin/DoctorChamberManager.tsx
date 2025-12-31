import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Clock, Phone, Calendar, Building2, Plus, Edit, Trash2, 
  Save, X, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Chamber {
  id: number;
  name: string;
  address: string;
  phone: string;
  days: string[];
  timing: string;
  appointmentFee: string;
  serialAvailable: boolean;
  coordinates?: { lat: number; lng: number };
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  chambers: Chamber[];
}

// Mock data for doctors with chambers
const initialDoctorsWithChambers: Doctor[] = [
  {
    id: 1,
    name: "Dr. Fazle Rabbi Chowdhury",
    specialty: "Cardiologist",
    hospital: "Square Hospital",
    chambers: [
      {
        id: 1,
        name: "Square Hospital",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205",
        phone: "+880 2-8144400",
        days: ["Sunday", "Tuesday", "Thursday"],
        timing: "4:00 PM - 8:00 PM",
        appointmentFee: "৳2,500",
        serialAvailable: true,
        coordinates: { lat: 23.7505, lng: 90.3812 },
      },
      {
        id: 2,
        name: "Personal Chamber",
        address: "House 45, Road 12, Dhanmondi, Dhaka 1209",
        phone: "+880 1711-123456",
        days: ["Monday", "Wednesday"],
        timing: "6:00 PM - 9:00 PM",
        appointmentFee: "৳2,000",
        serialAvailable: true,
        coordinates: { lat: 23.7461, lng: 90.3742 },
      },
    ],
  },
  {
    id: 2,
    name: "Dr. Mir Jamal Uddin",
    specialty: "Cardiologist",
    hospital: "United Hospital",
    chambers: [
      {
        id: 1,
        name: "United Hospital",
        address: "Plot 15, Road 71, Gulshan, Dhaka 1212",
        phone: "+880 2-8431661",
        days: ["Saturday", "Monday", "Wednesday"],
        timing: "10:00 AM - 2:00 PM",
        appointmentFee: "৳2,000",
        serialAvailable: true,
        coordinates: { lat: 23.7957, lng: 90.4149 },
      },
    ],
  },
  {
    id: 3,
    name: "Dr. Quazi Deen Mohammad",
    specialty: "Neurologist",
    hospital: "National Institute of Neurosciences",
    chambers: [
      {
        id: 1,
        name: "National Institute of Neurosciences",
        address: "Sher-E-Bangla Nagar, Agargaon, Dhaka 1207",
        phone: "+880 2-9116551",
        days: ["Sunday", "Tuesday", "Thursday"],
        timing: "9:00 AM - 1:00 PM",
        appointmentFee: "৳2,500",
        serialAvailable: true,
        coordinates: { lat: 23.7774, lng: 90.3656 },
      },
      {
        id: 2,
        name: "Praava Health",
        address: "Plot 35, Block D, Bashundhara R/A, Dhaka",
        phone: "+880 9612-016016",
        days: ["Saturday", "Wednesday"],
        timing: "5:00 PM - 8:00 PM",
        appointmentFee: "৳3,000",
        serialAvailable: true,
        coordinates: { lat: 23.8198, lng: 90.4332 },
      },
    ],
  },
];

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface DoctorChamberManagerProps {
  onClose?: () => void;
}

export default function DoctorChamberManager({ onClose }: DoctorChamberManagerProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctorsWithChambers);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null);
  const [editingChamber, setEditingChamber] = useState<{ doctorId: number; chamber: Chamber | null } | null>(null);
  const [isAddingChamber, setIsAddingChamber] = useState<number | null>(null);

  const [chamberForm, setChamberForm] = useState<Partial<Chamber>>({
    name: "",
    address: "",
    phone: "",
    days: [],
    timing: "",
    appointmentFee: "",
    serialAvailable: true,
  });

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditChamber = (doctorId: number, chamber: Chamber) => {
    setEditingChamber({ doctorId, chamber });
    setChamberForm({ ...chamber });
  };

  const handleAddNewChamber = (doctorId: number) => {
    setIsAddingChamber(doctorId);
    setChamberForm({
      name: "",
      address: "",
      phone: "",
      days: [],
      timing: "",
      appointmentFee: "",
      serialAvailable: true,
    });
  };

  const handleSaveChamber = () => {
    if (editingChamber) {
      setDoctors((prev) =>
        prev.map((doctor) => {
          if (doctor.id === editingChamber.doctorId) {
            return {
              ...doctor,
              chambers: doctor.chambers.map((c) =>
                c.id === editingChamber.chamber?.id ? { ...c, ...chamberForm } as Chamber : c
              ),
            };
          }
          return doctor;
        })
      );
      setEditingChamber(null);
    } else if (isAddingChamber) {
      const newChamber: Chamber = {
        id: Date.now(),
        name: chamberForm.name || "",
        address: chamberForm.address || "",
        phone: chamberForm.phone || "",
        days: chamberForm.days || [],
        timing: chamberForm.timing || "",
        appointmentFee: chamberForm.appointmentFee || "",
        serialAvailable: chamberForm.serialAvailable ?? true,
      };
      setDoctors((prev) =>
        prev.map((doctor) => {
          if (doctor.id === isAddingChamber) {
            return {
              ...doctor,
              chambers: [...doctor.chambers, newChamber],
            };
          }
          return doctor;
        })
      );
      setIsAddingChamber(null);
    }
    setChamberForm({});
  };

  const handleDeleteChamber = (doctorId: number, chamberId: number) => {
    setDoctors((prev) =>
      prev.map((doctor) => {
        if (doctor.id === doctorId) {
          return {
            ...doctor,
            chambers: doctor.chambers.filter((c) => c.id !== chamberId),
          };
        }
        return doctor;
      })
    );
  };

  const toggleDay = (day: string) => {
    setChamberForm((prev) => ({
      ...prev,
      days: prev.days?.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...(prev.days || []), day],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, specialty, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {filteredDoctors.map((doctor) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Doctor Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedDoctor(expandedDoctor === doctor.id ? null : doctor.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialty} • {doctor.hospital}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {doctor.chambers.length} chamber{doctor.chambers.length !== 1 ? "s" : ""}
                </span>
                {expandedDoctor === doctor.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Chambers */}
            <AnimatePresence>
              {expandedDoctor === doctor.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {doctor.chambers.map((chamber) => (
                      <div
                        key={chamber.id}
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {chamber.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{chamber.address}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditChamber(doctor.id, chamber)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteChamber(doctor.id, chamber.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{chamber.days.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{chamber.timing}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{chamber.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="font-semibold text-foreground">{chamber.appointmentFee}</span>
                          </div>
                        </div>

                        {chamber.serialAvailable && (
                          <span className="inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium bg-healthcare-green-light text-healthcare-green">
                            Serial Available
                          </span>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="healthcare-outline"
                      className="w-full"
                      onClick={() => handleAddNewChamber(doctor.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Chamber
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors found matching your search.</p>
          </div>
        )}
      </div>

      {/* Edit/Add Chamber Dialog */}
      <Dialog
        open={editingChamber !== null || isAddingChamber !== null}
        onOpenChange={() => {
          setEditingChamber(null);
          setIsAddingChamber(null);
          setChamberForm({});
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingChamber ? "Edit Chamber" : "Add New Chamber"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Chamber Name</Label>
              <Input
                value={chamberForm.name || ""}
                onChange={(e) => setChamberForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Square Hospital, Personal Chamber"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={chamberForm.address || ""}
                onChange={(e) => setChamberForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Full address with area and city"
                rows={2}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={chamberForm.phone || ""}
                onChange={(e) => setChamberForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+880 XXXX-XXXXXX"
              />
            </div>

            <div>
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={chamberForm.days?.includes(day) ? "healthcare" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day.substring(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Timing</Label>
              <Input
                value={chamberForm.timing || ""}
                onChange={(e) => setChamberForm((prev) => ({ ...prev, timing: e.target.value }))}
                placeholder="e.g., 4:00 PM - 8:00 PM"
              />
            </div>

            <div>
              <Label>Appointment Fee</Label>
              <Input
                value={chamberForm.appointmentFee || ""}
                onChange={(e) => setChamberForm((prev) => ({ ...prev, appointmentFee: e.target.value }))}
                placeholder="e.g., ৳1,500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="serialAvailable"
                checked={chamberForm.serialAvailable ?? true}
                onCheckedChange={(checked) =>
                  setChamberForm((prev) => ({ ...prev, serialAvailable: checked === true }))
                }
              />
              <Label htmlFor="serialAvailable" className="cursor-pointer">
                Serial Available
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingChamber(null);
                setIsAddingChamber(null);
                setChamberForm({});
              }}
            >
              Cancel
            </Button>
            <Button variant="healthcare" onClick={handleSaveChamber}>
              <Save className="w-4 h-4 mr-2" />
              Save Chamber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
