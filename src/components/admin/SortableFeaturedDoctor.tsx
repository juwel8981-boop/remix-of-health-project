import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  hospital_affiliation: string | null;
  is_featured: boolean;
  featured_rank: number | null;
  verification_status: string;
}

interface SortableFeaturedDoctorProps {
  doctor: Doctor;
  index: number;
  onRemove: (doctor: Doctor) => void;
}

export default function SortableFeaturedDoctor({ doctor, index, onRemove }: SortableFeaturedDoctorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doctor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="healthcare-card flex items-center gap-4"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
        #{index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-foreground truncate">{doctor.full_name}</p>
          <Badge variant="secondary" className="text-xs">{doctor.specialization}</Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{doctor.hospital_affiliation || "Independent Practice"}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 shrink-0"
        onClick={() => onRemove(doctor)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
