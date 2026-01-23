import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Pill, Plus, Edit2, Trash2, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

const defaultForm: MedicationFormData = {
  name: "",
  dosage: "",
  frequency: "",
  remaining: 0,
  reminder_time: "08:00",
  reminder_enabled: true,
  notes: ""
};

export function PatientReminders() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [form, setForm] = useState<MedicationFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .order('reminder_time', { ascending: true });
      
      if (data && !error) {
        setMedications(data);
      }
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingMedication(null);
    setForm(defaultForm);
    setShowDialog(true);
  };

  const openEditDialog = (medication: Medication) => {
    setEditingMedication(medication);
    setForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      remaining: medication.remaining,
      reminder_time: medication.reminder_time || "08:00",
      reminder_enabled: medication.reminder_enabled,
      notes: medication.notes || ""
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.dosage.trim() || !form.frequency.trim()) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      setSaving(false);
      return;
    }

    const medicationData = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency.trim(),
      remaining: form.remaining,
      reminder_time: form.reminder_enabled ? form.reminder_time : null,
      reminder_enabled: form.reminder_enabled,
      notes: form.notes.trim() || null,
      user_id: user.id
    };

    if (editingMedication) {
      const { error } = await supabase
        .from('medications')
        .update(medicationData)
        .eq('id', editingMedication.id);
      
      if (error) {
        toast({ title: "Error", description: "Failed to update reminder", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Reminder updated" });
        setShowDialog(false);
        fetchMedications();
      }
    } else {
      const { error } = await supabase
        .from('medications')
        .insert(medicationData);
      
      if (error) {
        toast({ title: "Error", description: "Failed to create reminder", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Reminder created" });
        setShowDialog(false);
        fetchMedications();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete reminder", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reminder deleted" });
      fetchMedications();
    }
  };

  const toggleReminder = async (medication: Medication) => {
    const { error } = await supabase
      .from('medications')
      .update({ reminder_enabled: !medication.reminder_enabled })
      .eq('id', medication.id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to toggle reminder", variant: "destructive" });
    } else {
      toast({
        title: medication.reminder_enabled ? "Reminder disabled" : "Reminder enabled",
        description: medication.reminder_enabled 
          ? `Reminder for ${medication.name} turned off`
          : `You'll be reminded at ${medication.reminder_time || "08:00"}`
      });
      fetchMedications();
    }
  };

  const activeReminders = medications.filter(m => m.reminder_enabled);
  const inactiveReminders = medications.filter(m => !m.reminder_enabled);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Medication Reminders</h2>
          <p className="text-muted-foreground">Manage your medication schedule</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </motion.div>

      {/* Active Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="healthcare-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Active Reminders</h3>
          <span className="text-sm text-muted-foreground">({activeReminders.length})</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : activeReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active reminders</p>
            <Button variant="link" onClick={openAddDialog}>Set up a reminder</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReminders.map((med) => (
              <div key={med.id} className="p-4 rounded-lg bg-primary/5 border border-primary/20 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Clock className="w-4 h-4" />
                        {med.reminder_time}
                      </div>
                      <span className="text-xs text-muted-foreground">{med.remaining} pills left</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleReminder(med)}>
                        <BellOff className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(med)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(med.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {med.notes && <p className="text-sm text-muted-foreground mt-2 ml-13">{med.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Inactive Reminders */}
      {inactiveReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="healthcare-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold text-foreground">Inactive Reminders</h3>
            <span className="text-sm text-muted-foreground">({inactiveReminders.length})</span>
          </div>
          
          <div className="space-y-3">
            {inactiveReminders.map((med) => (
              <div key={med.id} className="p-4 rounded-lg bg-muted group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => toggleReminder(med)}>
                      <Bell className="w-4 h-4 mr-1" />
                      Enable
                    </Button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(med)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(med.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
            <DialogDescription>Set up medication reminders to stay on track.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name *</Label>
              <Input 
                id="med-name"
                placeholder="e.g., Lisinopril"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="med-dosage">Dosage *</Label>
                <Input 
                  id="med-dosage"
                  placeholder="e.g., 10mg"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-frequency">Frequency *</Label>
                <Input 
                  id="med-frequency"
                  placeholder="e.g., Once daily"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="med-remaining">Pills Remaining</Label>
              <Input 
                id="med-remaining"
                type="number"
                min="0"
                value={form.remaining}
                onChange={(e) => setForm({ ...form, remaining: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Daily Reminder</p>
                  <p className="text-sm text-muted-foreground">Get notified at a specific time</p>
                </div>
              </div>
              <Switch 
                checked={form.reminder_enabled}
                onCheckedChange={(checked) => setForm({ ...form, reminder_enabled: checked })}
              />
            </div>
            
            {form.reminder_enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Input 
                  id="reminder-time"
                  type="time"
                  value={form.reminder_time}
                  onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="med-notes">Notes (optional)</Label>
              <Input 
                id="med-notes"
                placeholder="e.g., Take with food"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingMedication ? 'Update' : 'Add Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
