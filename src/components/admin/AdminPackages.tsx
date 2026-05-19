import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTenantPackages } from "@/lib/tenant";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useViewerMode } from "@/contexts/ViewerModeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Lock, Upload, FileText, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, CURRENCY } from "@/lib/currency";
import ImageUpload from "./ImageUpload";
import { AdminActionButton } from "./AdminActionButton";

interface Package {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  type: string;
  price: number;
  duration_days: number;
  includes: string[] | null;
  exclusions: string[] | null;
  hotel_rating: number | null;
  hotel_type: string | null;
  transport_type: string | null;
  flight_type: string | null;
  special_notes: string | null;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  show_view_details: boolean;
  show_book_now: boolean;
  hotel_image_url: string | null;
  hotel_map_link: string | null;
  pdf_url: string | null;
  order_index: number;
}

interface AdminPackagesProps {
  onUpdate: () => void;
}

interface SortableRowProps {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  isViewerMode: boolean;
}

const SortableRow = ({ pkg, onEdit, onDelete, onToggleActive, isViewerMode }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pkg.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{pkg.title}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{pkg.type}</Badge>
      </TableCell>
      <TableCell className="font-bold">{formatCurrency(pkg.price)}</TableCell>
      <TableCell>{pkg.duration_days} days</TableCell>
      <TableCell>{pkg.stock}</TableCell>
      <TableCell>
        <Switch
          checked={pkg.is_active}
          onCheckedChange={() => onToggleActive(pkg.id, pkg.is_active)}
          disabled={isViewerMode}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <AdminActionButton variant="ghost" size="icon" onClick={() => onEdit(pkg)}>
            <Edit className="w-4 h-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(pkg.id)}
          >
            <Trash2 className="w-4 h-4" />
          </AdminActionButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminPackages = ({ onUpdate }: AdminPackagesProps) => {
  const { toast } = useToast();
  const { isViewerMode } = useViewerMode();
  const { uploadImage, uploading } = useImageUpload({
    bucket: "admin-uploads",
    folder: "packages",
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    type: "hajj" as "hajj" | "umrah",
    price: 0,
    duration_days: 7,
    includes: "",
    exclusions: "",
    hotel_rating: 5,
    hotel_type: "",
    transport_type: "",
    flight_type: "",
    special_notes: "",
    stock: 50,
    is_active: true,
    image_url: "",
    show_view_details: true,
    show_book_now: true,
    hotel_image_url: "",
    hotel_map_link: "",
    pdf_url: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await getTenantPackages({
      activeOnly: false,
    });

    if (!error && data) {
      // Sort: Hajj first, then Umrah; within each group by order_index asc
      const sorted = [...data].sort((a: any, b: any) => {
        const typeRank = (t: string) => (t === "hajj" ? 0 : 1);
        const tr = typeRank(a.type) - typeRank(b.type);
        if (tr !== 0) return tr;
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      });
      setPackages(sorted);
    }
    setLoading(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent, type: "hajj" | "umrah") => {
    if (isViewerMode) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sameType = packages.filter((p) => p.type === type);
    const oldIndex = sameType.findIndex((p) => p.id === active.id);
    const newIndex = sameType.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sameType, oldIndex, newIndex);
    const updated = reordered.map((p, idx) => ({ ...p, order_index: idx + 1 }));

    // Optimistic local update
    const others = packages.filter((p) => p.type !== type);
    setPackages([...others, ...updated].sort((a, b) => {
      const typeRank = (t: string) => (t === "hajj" ? 0 : 1);
      const tr = typeRank(a.type) - typeRank(b.type);
      if (tr !== 0) return tr;
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    }));

    try {
      await Promise.all(
        updated.map((p) =>
          supabase.from("packages").update({ order_index: p.order_index }).eq("id", p.id)
        )
      );
      toast({ title: "Order updated" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to save new order", variant: "destructive" });
      fetchPackages();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      full_description: "",
      type: "hajj",
      price: 0,
      duration_days: 7,
      includes: "",
      exclusions: "",
      hotel_rating: 5,
      hotel_type: "",
      transport_type: "",
      flight_type: "",
      special_notes: "",
      stock: 50,
      is_active: true,
      image_url: "",
      show_view_details: true,
      show_book_now: true,
      hotel_image_url: "",
      hotel_map_link: "",
      pdf_url: "",
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description || "",
      full_description: pkg.full_description || "",
      type: pkg.type as "hajj" | "umrah",
      price: pkg.price,
      duration_days: pkg.duration_days,
      includes: pkg.includes?.join("\n") || "",
      exclusions: pkg.exclusions?.join("\n") || "",
      hotel_rating: pkg.hotel_rating || 5,
      hotel_type: pkg.hotel_type || "",
      transport_type: pkg.transport_type || "",
      flight_type: pkg.flight_type || "",
      special_notes: pkg.special_notes || "",
      stock: pkg.stock,
      is_active: pkg.is_active,
      image_url: pkg.image_url || "",
      show_view_details: pkg.show_view_details ?? true,
      show_book_now: pkg.show_book_now ?? true,
      hotel_image_url: pkg.hotel_image_url || "",
      hotel_map_link: pkg.hotel_map_link || "",
      pdf_url: pkg.pdf_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const packageData = {
      title: formData.title,
      description: formData.description || null,
      full_description: formData.full_description || null,
      type: formData.type,
      price: formData.price,
      duration_days: formData.duration_days,
      includes: formData.includes.split("\n").filter(Boolean),
      exclusions: formData.exclusions.split("\n").filter(Boolean),
      hotel_rating: formData.hotel_rating,
      hotel_type: formData.hotel_type || null,
      transport_type: formData.transport_type || null,
      flight_type: formData.flight_type || null,
      special_notes: formData.special_notes || null,
      stock: formData.stock,
      is_active: formData.is_active,
      image_url: formData.image_url || null,
      show_view_details: formData.show_view_details,
      show_book_now: formData.show_book_now,
      hotel_image_url: formData.hotel_image_url || null,
      hotel_map_link: formData.hotel_map_link || null,
      pdf_url: formData.pdf_url || null,
    };

    let error;

    if (editingPackage) {
      ({ error } = await supabase
        .from("packages")
        .update(packageData)
        .eq("id", editingPackage.id));
    } else {
      ({ error } = await supabase.from("packages").insert(packageData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingPackage ? "update" : "create"} package`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Package ${editingPackage ? "updated" : "created"} successfully`,
      });
      fetchPackages();
      onUpdate();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const { error } = await supabase.from("packages").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete package. It may have existing bookings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      fetchPackages();
      onUpdate();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("packages")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      fetchPackages();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Packages ({packages.length})</span>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (isViewerMode) return;
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <AdminActionButton className="gap-2">
                <Plus className="w-4 h-4" />
                Add Package
              </AdminActionButton>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Package Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "hajj" | "umrah") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hajj">Hajj</SelectItem>
                        <SelectItem value="umrah">Umrah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ({CURRENCY.symbol} {CURRENCY.code})</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_days: parseInt(e.target.value) || 7 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Hotel Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.hotel_rating}
                      onChange={(e) =>
                        setFormData({ ...formData, hotel_rating: parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description (card preview)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description shown on package card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description (details modal)</Label>
                  <Textarea
                    id="full_description"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    rows={4}
                    placeholder="Detailed description shown when viewing package details"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotel_type">Hotel Type</Label>
                    <Input
                      id="hotel_type"
                      value={formData.hotel_type}
                      onChange={(e) => setFormData({ ...formData, hotel_type: e.target.value })}
                      placeholder="e.g., 5-star Luxury"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transport_type">Transport Type</Label>
                    <Input
                      id="transport_type"
                      value={formData.transport_type}
                      onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                      placeholder="e.g., AC Bus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flight_type">Flight Type</Label>
                    <Input
                      id="flight_type"
                      value={formData.flight_type}
                      onChange={(e) => setFormData({ ...formData, flight_type: e.target.value })}
                      placeholder="e.g., Economy"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="includes">Inclusions (one per line)</Label>
                  <Textarea
                    id="includes"
                    value={formData.includes}
                    onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                    placeholder="Round-trip flights&#10;5-star hotel&#10;Visa processing"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclusions">Exclusions (one per line)</Label>
                  <Textarea
                    id="exclusions"
                    value={formData.exclusions}
                    onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                    placeholder="Personal expenses&#10;Tips&#10;Extra baggage"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special_notes">Special Notes / Conditions</Label>
                  <Textarea
                    id="special_notes"
                    value={formData.special_notes}
                    onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                    rows={3}
                    placeholder="Any special conditions or notes for this package"
                  />
                </div>

                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  onUpload={uploadImage}
                  uploading={uploading}
                  label="Package Image"
                  placeholder="https://example.com/package-image.jpg"
                />

                <div className="space-y-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <h4 className="font-medium text-sm text-secondary">Hotel Image & Map</h4>
                  <ImageUpload
                    value={formData.hotel_image_url}
                    onChange={(url) => setFormData({ ...formData, hotel_image_url: url })}
                    onUpload={uploadImage}
                    uploading={uploading}
                    label="Hotel Image (shown on card side)"
                    placeholder="https://example.com/hotel-image.jpg"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="hotel_map_link">Hotel Map Link (Google Maps)</Label>
                    <Input
                      id="hotel_map_link"
                      value={formData.hotel_map_link}
                      onChange={(e) => setFormData({ ...formData, hotel_map_link: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                </div>

                {/* PDF Upload Section */}
                <div className="space-y-3 p-3 bg-accent/30 rounded-lg border border-accent/50">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Package PDF Brochure
                  </h4>
                  {formData.pdf_url ? (
                    <div className="flex items-center gap-2">
                      <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline truncate flex-1">
                        {formData.pdf_url.split('/').pop()}
                      </a>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setFormData({ ...formData, pdf_url: "" })}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : null}
                  <div>
                    <Label htmlFor="pdf_upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                      </div>
                    </Label>
                    <input
                      id="pdf_upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
                          return;
                        }
                        const ext = file.name.split(".").pop() || "pdf";
                        const fileName = `packages/pdf/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                        const { error: uploadError } = await supabase.storage.from("admin-uploads").upload(fileName, file, { cacheControl: "31536000", contentType: file.type });
                        if (uploadError) {
                          toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
                          return;
                        }
                        const { data: urlData } = supabase.storage.from("admin-uploads").getPublicUrl(fileName);
                        setFormData({ ...formData, pdf_url: urlData.publicUrl });
                        toast({ title: "PDF uploaded successfully" });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdf_url_manual">Or paste PDF URL</Label>
                    <Input
                      id="pdf_url_manual"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                      placeholder="https://example.com/brochure.pdf"
                    />
                  </div>
                </div>
                </div>

                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">Visibility Controls</h4>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="active">Package Active (visible to customers)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show_view_details"
                      checked={formData.show_view_details}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, show_view_details: checked })
                      }
                    />
                    <Label htmlFor="show_view_details">Show "View Details" Button</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show_book_now"
                      checked={formData.show_book_now}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, show_book_now: checked })
                      }
                    />
                    <Label htmlFor="show_book_now">Show "Book Now" Button</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary">
                    {editingPackage ? "Update" : "Create"} Package
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg, idx) => {
                const sameType = packages.filter((p) => p.type === pkg.type);
                const sameIdx = sameType.findIndex((p) => p.id === pkg.id);
                return (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div className="flex flex-col items-center gap-0.5">
                      <AdminActionButton
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveOrder(pkg, "up")}
                        disabled={sameIdx === 0}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </AdminActionButton>
                      <span className="text-xs text-muted-foreground">{sameIdx + 1}</span>
                      <AdminActionButton
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveOrder(pkg, "down")}
                        disabled={sameIdx === sameType.length - 1}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </AdminActionButton>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{pkg.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {pkg.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(pkg.price)}</TableCell>
                  <TableCell>{pkg.duration_days} days</TableCell>
                  <TableCell>{pkg.stock}</TableCell>
                  <TableCell>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => toggleActive(pkg.id, pkg.is_active)}
                      disabled={isViewerMode}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AdminActionButton variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                        <Edit className="w-4 h-4" />
                      </AdminActionButton>
                      <AdminActionButton
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </AdminActionButton>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPackages;
