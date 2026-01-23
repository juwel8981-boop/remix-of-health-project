import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, FileText, Calendar, Bell, Activity, Pill, Upload, Clock,
  Heart, TrendingUp, Plus, ChevronRight, Brain, Droplet, Ruler, Scale, Trash2, Edit2, Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PatientHealthTracker } from "@/components/patient/PatientHealthTracker";
import { PatientReminders } from "@/components/patient/PatientReminders";
import { PatientMyArticles } from "@/components/patient/PatientMyArticles";

type TabType = "overview" | "health-tracker" | "reminders" | "my-articles";

const sidebarLinks: { name: string; icon: typeof Activity; tab: TabType | null; href?: string }[] = [
  { name: "Overview", icon: Activity, tab: "overview" },
  { name: "My Profile", icon: User, tab: null, href: "/settings" },
  { name: "EHR Records", icon: FileText, tab: null, href: "/patient/ehr" },
  { name: "Appointments", icon: Calendar, tab: null, href: "/patient/appointments" },
  { name: "Health Tracker", icon: Heart, tab: "health-tracker" },
  { name: "Reminders", icon: Bell, tab: "reminders" },
  { name: "My Articles", icon: Newspaper, tab: "my-articles" },
];

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  reminder_time: string | null;
  reminder_enabled: boolean;
  notes: string | null;
}

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  reminder_time: string;
  reminder_enabled: boolean;
  notes: string;
}

const defaultMedicationForm: MedicationFormData = {
  name: "",
  dosage: "",
  frequency: "",
  remaining: 0,
  reminder_time: "08:00",
  reminder_enabled: false,
  notes: ""
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [patientData, setPatientData] = useState<{
    full_name: string;
    blood_group: string | null;
    date_of_birth: string | null;
    weight: number | null;
    height: number | null;
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationForm, setMedicationForm] = useState<MedicationFormData>(defaultMedicationForm);
  const [savingMedication, setSavingMedication] = useState(false);
  const [ehrCount, setEhrCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('patients')
          .select('full_name, blood_group, date_of_birth, weight, height')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setPatientData(data);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.avatar_url) {
          const url = profile.avatar_url.includes('?') 
            ? profile.avatar_url 
            : `${profile.avatar_url}?t=${Date.now()}`;
          setAvatarUrl(url);
        }

        const { count: ehrCountData } = await supabase
          .from('ehr_records')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setEhrCount(ehrCountData || 0);

        const { count: apptCount } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0]);
        setAppointmentCount(apptCount || 0);
      }
    };
    fetchPatientData();
  }, []);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setMedications(data);
      }
    }
  };

  const calculateAge = (dob: string | null): string => {
    if (!dob) return "--";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const calculateBMI = (weight: number | null, height: number | null): { value: string; status: string } => {
    if (!weight || !height) return { value: "--", status: "unknown" };
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiValue = bmi.toFixed(1);
    
    let status = "normal";
    if (bmi < 18.5) status = "underweight";
    else if (bmi >= 25 && bmi < 30) status = "overweight";
    else if (bmi >= 30) status = "obese";
    
    return { value: bmiValue, status };
  };

  const firstName = patientData?.full_name?.split(' ')[0] || 'User';
  const bmiData = calculateBMI(patientData?.weight ?? null, patientData?.height ?? null);

  const healthStats = [
    { label: "Age", value: calculateAge(patientData?.date_of_birth ?? null), unit: "years", status: "normal", icon: User },
    { label: "Blood Group", value: patientData?.blood_group || "--", unit: "", status: "normal", icon: Droplet },
    { label: "Weight", value: patientData?.weight?.toString() || "--", unit: "kg", status: "normal", icon: Scale },
    { label: "Height", value: patientData?.height?.toString() || "--", unit: "cm", status: "normal", icon: Ruler },
    { label: "BMI", value: bmiData.value, unit: "", status: bmiData.status === "unknown" ? "normal" : bmiData.status, icon: TrendingUp },
  ];

  const openAddMedicationDialog = () => {
    setEditingMedication(null);
    setMedicationForm(defaultMedicationForm);
    setShowMedicationDialog(true);
  };

  const openEditMedicationDialog = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      remaining: medication.remaining,
      reminder_time: medication.reminder_time || "08:00",
      reminder_enabled: medication.reminder_enabled,
      notes: medication.notes || ""
    });
    setShowMedicationDialog(true);
  };

  const handleSaveMedication = async () => {
    if (!medicationForm.name.trim() || !medicationForm.dosage.trim() || !medicationForm.frequency.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSavingMedication(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive"
      });
      setSavingMedication(false);
      return;
    }

    const medicationData = {
      name: medicationForm.name.trim(),
      dosage: medicationForm.dosage.trim(),
      frequency: medicationForm.frequency.trim(),
      remaining: medicationForm.remaining,
      reminder_time: medicationForm.reminder_enabled ? medicationForm.reminder_time : null,
      reminder_enabled: medicationForm.reminder_enabled,
      notes: medicationForm.notes.trim() || null,
      user_id: user.id
    };

    if (editingMedication) {
      const { error } = await supabase
        .from('medications')
        .update(medicationData)
        .eq('id', editingMedication.id);
      
      if (error) {
        toast({ title: "Error", description: "Failed to update medication", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Medication updated successfully" });
        setShowMedicationDialog(false);
        fetchMedications();
      }
    } else {
      const { error } = await supabase
        .from('medications')
        .insert(medicationData);
      
      if (error) {
        toast({ title: "Error", description: "Failed to add medication", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Medication added successfully" });
        setShowMedicationDialog(false);
        fetchMedications();
      }
    }
    setSavingMedication(false);
  };

  const handleDeleteMedication = async (id: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete medication", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Medication deleted successfully" });
      fetchMedications();
    }
  };

  const toggleReminder = async (medication: Medication) => {
    const { error } = await supabase
      .from('medications')
      .update({ reminder_enabled: !medication.reminder_enabled })
      .eq('id', medication.id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to update reminder", variant: "destructive" });
    } else {
      toast({
        title: medication.reminder_enabled ? "Reminder disabled" : "Reminder enabled",
        description: medication.reminder_enabled 
          ? `Reminder for ${medication.name} has been turned off`
          : `You'll be reminded to take ${medication.name} at ${medication.reminder_time || "08:00"}`
      });
      fetchMedications();
    }
  };

  const handleSidebarClick = (link: typeof sidebarLinks[0]) => {
    if (link.href) {
      navigate(link.href);
    } else if (link.tab) {
      setActiveTab(link.tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "health-tracker":
        return <PatientHealthTracker />;
      case "reminders":
        return <PatientReminders />;
      case "my-articles":
        return <PatientMyArticles />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your health and upcoming activities.
          </p>
        </motion.div>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {healthStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="healthcare-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.status === "normal" 
                  ? "bg-healthcare-green-light text-healthcare-green" 
                  : stat.status === "underweight" || stat.status === "overweight"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : stat.status === "obese"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}>
                {stat.status}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 healthcare-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Upcoming Appointments
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/appointments">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {appointmentCount > 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="text-foreground font-medium">{appointmentCount} upcoming appointment{appointmentCount !== 1 ? 's' : ''}</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/patient/appointments">View Appointments</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming appointments</p>
              <Button 
                variant="healthcare-outline" 
                className="mt-4"
                onClick={() => navigate('/patient/book-appointment')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </div>
          )}
        </motion.div>

        {/* Medications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="healthcare-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              My Medications
            </h2>
            <Button variant="outline" size="sm" onClick={openAddMedicationDialog}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No medications added yet</p>
              <Button variant="link" onClick={openAddMedicationDialog}>Add your first medication</Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {medications.map((med) => (
                <div key={med.id} className="p-3 rounded-lg bg-muted group">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground">{med.name}</h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMedicationDialog(med)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteMedication(med.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((med.remaining / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {med.remaining} left
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleReminder(med)}
                    className={`mt-2 text-xs flex items-center gap-1 ${med.reminder_enabled ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`}
                  >
                    <Clock className="w-3 h-3" />
                    {med.reminder_enabled ? `Reminder at ${med.reminder_time}` : 'Set Reminder'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* EHR Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="healthcare-card mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Electronic Health Records (EHR)
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/patient/ehr">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/ehr">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {ehrCount > 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-primary" />
            <p className="text-foreground font-medium">{ehrCount} record{ehrCount !== 1 ? 's' : ''} stored</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/patient/ehr">View All Records</Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No EHR records uploaded yet</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/patient/ehr">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Record
              </Link>
            </Button>
          </div>
        )}
      </motion.div>

      {/* AI Doctor Finder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl font-semibold text-primary-foreground mb-1">
              AI Doctor Finder
            </h3>
            <p className="text-primary-foreground/80">
              Describe your symptoms and get intelligent recommendations for the right specialist.
            </p>
          </div>
          <Button variant="hero" size="lg" asChild>
            <Link to="/ai-doctor-finder">Try Now</Link>
          </Button>
        </div>
      </motion.div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-16 md:top-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={avatarUrl || undefined} alt="Patient" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {patientData?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{patientData?.full_name || 'Patient'}</p>
                <p className="text-sm text-muted-foreground">Patient</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleSidebarClick(link)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      link.tab && activeTab === link.tab
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Medication Dialog */}
      <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
            <DialogDescription>
              {editingMedication ? 'Update your medication details below.' : 'Add a new medication to track your prescriptions.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name *</Label>
              <Input 
                id="med-name"
                placeholder="e.g., Lisinopril"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="med-dosage">Dosage *</Label>
                <Input 
                  id="med-dosage"
                  placeholder="e.g., 10mg"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-frequency">Frequency *</Label>
                <Input 
                  id="med-frequency"
                  placeholder="e.g., Once daily"
                  value={medicationForm.frequency}
                  onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-remaining">Pills Remaining</Label>
              <Input 
                id="med-remaining"
                type="number"
                min="0"
                placeholder="0"
                value={medicationForm.remaining}
                onChange={(e) => setMedicationForm({ ...medicationForm, remaining: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Daily Reminder</p>
                  <p className="text-sm text-muted-foreground">Get notified when it's time to take</p>
                </div>
              </div>
              <Switch 
                checked={medicationForm.reminder_enabled}
                onCheckedChange={(checked) => setMedicationForm({ ...medicationForm, reminder_enabled: checked })}
              />
            </div>
            
            {medicationForm.reminder_enabled && (
              <div className="space-y-2">
                <Label htmlFor="med-time">Reminder Time</Label>
                <Input 
                  id="med-time"
                  type="time"
                  value={medicationForm.reminder_time}
                  onChange={(e) => setMedicationForm({ ...medicationForm, reminder_time: e.target.value })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="med-notes">Notes (optional)</Label>
              <Input 
                id="med-notes"
                placeholder="e.g., Take with food"
                value={medicationForm.notes}
                onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMedicationDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMedication} disabled={savingMedication}>
              {savingMedication ? 'Saving...' : editingMedication ? 'Update' : 'Add Medication'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
