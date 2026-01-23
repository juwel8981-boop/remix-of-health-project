import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Heart, Droplet, Activity, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HealthEntry {
  id: string;
  weight: number | null;
  height: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  blood_sugar: number | null;
  notes: string | null;
  tracked_date: string;
  created_at: string;
}

interface HealthFormData {
  weight: string;
  height: string;
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  blood_sugar: string;
  notes: string;
  tracked_date: string;
}

const defaultForm: HealthFormData = {
  weight: "",
  height: "",
  blood_pressure_systolic: "",
  blood_pressure_diastolic: "",
  heart_rate: "",
  blood_sugar: "",
  notes: "",
  tracked_date: new Date().toISOString().split('T')[0]
};

export function PatientHealthTracker() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HealthEntry | null>(null);
  const [form, setForm] = useState<HealthFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('health_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('tracked_date', { ascending: false })
        .limit(30);
      
      if (data && !error) {
        setEntries(data);
      }
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingEntry(null);
    setForm(defaultForm);
    setShowDialog(true);
  };

  const openEditDialog = (entry: HealthEntry) => {
    setEditingEntry(entry);
    setForm({
      weight: entry.weight?.toString() || "",
      height: entry.height?.toString() || "",
      blood_pressure_systolic: entry.blood_pressure_systolic?.toString() || "",
      blood_pressure_diastolic: entry.blood_pressure_diastolic?.toString() || "",
      heart_rate: entry.heart_rate?.toString() || "",
      blood_sugar: entry.blood_sugar?.toString() || "",
      notes: entry.notes || "",
      tracked_date: entry.tracked_date
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      setSaving(false);
      return;
    }

    const entryData = {
      user_id: user.id,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      blood_pressure_systolic: form.blood_pressure_systolic ? parseInt(form.blood_pressure_systolic) : null,
      blood_pressure_diastolic: form.blood_pressure_diastolic ? parseInt(form.blood_pressure_diastolic) : null,
      heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      blood_sugar: form.blood_sugar ? parseFloat(form.blood_sugar) : null,
      notes: form.notes.trim() || null,
      tracked_date: form.tracked_date
    };

    if (editingEntry) {
      const { error } = await supabase
        .from('health_tracking')
        .update(entryData)
        .eq('id', editingEntry.id);
      
      if (error) {
        toast({ title: "Error", description: "Failed to update entry", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Health entry updated" });
        setShowDialog(false);
        fetchEntries();
      }
    } else {
      const { error } = await supabase
        .from('health_tracking')
        .insert(entryData);
      
      if (error) {
        toast({ title: "Error", description: "Failed to add entry", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Health entry recorded" });
        setShowDialog(false);
        fetchEntries();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('health_tracking')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Entry deleted" });
      fetchEntries();
    }
  };

  const latestEntry = entries[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Health Tracker</h2>
          <p className="text-muted-foreground">Track your daily health metrics</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Log Entry
        </Button>
      </motion.div>

      {/* Latest Stats */}
      {latestEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {latestEntry.weight && (
            <div className="healthcare-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Weight</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{latestEntry.weight}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></p>
            </div>
          )}
          {latestEntry.blood_pressure_systolic && latestEntry.blood_pressure_diastolic && (
            <div className="healthcare-card">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Blood Pressure</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{latestEntry.blood_pressure_systolic}/{latestEntry.blood_pressure_diastolic}<span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span></p>
            </div>
          )}
          {latestEntry.heart_rate && (
            <div className="healthcare-card">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{latestEntry.heart_rate}<span className="text-sm font-normal text-muted-foreground ml-1">bpm</span></p>
            </div>
          )}
          {latestEntry.blood_sugar && (
            <div className="healthcare-card">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Blood Sugar</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{latestEntry.blood_sugar}<span className="text-sm font-normal text-muted-foreground ml-1">mg/dL</span></p>
            </div>
          )}
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="healthcare-card"
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Entries</h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No health entries recorded yet</p>
            <Button variant="link" onClick={openAddDialog}>Log your first entry</Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 rounded-lg bg-muted group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {format(new Date(entry.tracked_date), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(entry)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {entry.weight && <span>Weight: {entry.weight}kg</span>}
                  {entry.blood_pressure_systolic && <span>BP: {entry.blood_pressure_systolic}/{entry.blood_pressure_diastolic}</span>}
                  {entry.heart_rate && <span>HR: {entry.heart_rate}bpm</span>}
                  {entry.blood_sugar && <span>Sugar: {entry.blood_sugar}mg/dL</span>}
                </div>
                {entry.notes && <p className="text-sm text-muted-foreground mt-2 italic">{entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Health Entry' : 'Log Health Entry'}</DialogTitle>
            <DialogDescription>Record your health metrics for tracking.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracked-date">Date</Label>
              <Input 
                id="tracked-date"
                type="date"
                value={form.tracked_date}
                onChange={(e) => setForm({ ...form, tracked_date: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input 
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height"
                  type="number"
                  placeholder="175"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bp-systolic">BP Systolic (mmHg)</Label>
                <Input 
                  id="bp-systolic"
                  type="number"
                  placeholder="120"
                  value={form.blood_pressure_systolic}
                  onChange={(e) => setForm({ ...form, blood_pressure_systolic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-diastolic">BP Diastolic (mmHg)</Label>
                <Input 
                  id="bp-diastolic"
                  type="number"
                  placeholder="80"
                  value={form.blood_pressure_diastolic}
                  onChange={(e) => setForm({ ...form, blood_pressure_diastolic: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                <Input 
                  id="heart-rate"
                  type="number"
                  placeholder="72"
                  value={form.heart_rate}
                  onChange={(e) => setForm({ ...form, heart_rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
                <Input 
                  id="blood-sugar"
                  type="number"
                  step="0.1"
                  placeholder="100"
                  value={form.blood_sugar}
                  onChange={(e) => setForm({ ...form, blood_sugar: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input 
                id="notes"
                placeholder="Any observations..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingEntry ? 'Update' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
