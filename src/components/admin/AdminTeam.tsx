import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "./ImageUpload";
import { Plus, Edit, Trash2, User, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import IMOIcon from "../icons/IMOIcon";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  qualifications: string;
  avatar_url: string;
  board_type: string;
  order_index: number;
  is_active: boolean;
  whatsapp_number: string;
  imo_number: string;
}

interface SortableRowProps {
  item: TeamMember;
  position: number;
  onEdit: (item: TeamMember) => void;
  onDelete: (id: string) => void;
  onToggleActive: (item: TeamMember) => void;
  onMoveUp: (item: TeamMember) => void;
  onMoveDown: (item: TeamMember) => void;
  isFirst: boolean;
  isLast: boolean;
}

const SortableRow = ({
  item,
  position,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40 bg-muted/50" : "hover:bg-muted/30"}
    >
      <TableCell className="w-24">
        <div className="flex items-center gap-1">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-1.5 hover:bg-muted rounded-md border border-transparent hover:border-border"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${item.name} to reorder`}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMoveUp(item)}
              disabled={isFirst}
              aria-label={`Move ${item.name} up`}
              title="Move up"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMoveDown(item)}
              disabled={isLast}
              aria-label={`Move ${item.name} down`}
              title="Move down"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell className="w-10 text-center text-sm font-medium text-muted-foreground">
        {position}
      </TableCell>
      <TableCell>
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.avatar_url} alt={item.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.role}</TableCell>
      <TableCell>
        {item.whatsapp_number ? (
          <span className="flex items-center gap-1 text-[#25D366] text-sm">
            <WhatsAppIcon size={14} />
            {item.whatsapp_number}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {item.imo_number ? (
          <span className="flex items-center gap-1 text-[#3B82F6] text-sm">
            <IMOIcon size={14} />
            {item.imo_number}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="max-w-[200px]">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.qualifications || "—"}</p>
      </TableCell>
      <TableCell>
        <Switch checked={item.is_active} onCheckedChange={() => onToggleActive(item)} />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const DragPreview = ({ item }: { item: TeamMember }) => (
  <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg">
    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
    <Avatar className="h-9 w-9">
      <AvatarImage src={item.avatar_url} alt={item.name} />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="font-medium truncate">{item.name}</p>
      <p className="text-sm text-muted-foreground truncate">{item.role}</p>
    </div>
  </div>
);

const AdminTeam = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    qualifications: "",
    avatar_url: "",
    board_type: "management",
    whatsapp_number: "",
    imo_number: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { uploadImage, uploading } = useImageUpload({
    bucket: "admin-uploads",
    folder: "team",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("team_members").select("*").order("order_index");
    if (!error && data) setMembers(data);
    setLoading(false);
  };

  const mergeBoardOrder = (boardType: string, reordered: TeamMember[]) => {
    const updated = reordered.map((m, idx) => ({ ...m, order_index: idx }));
    const otherMembers = members.filter((m) => m.board_type !== boardType);
    setMembers(
      [...otherMembers, ...updated].sort((a, b) => {
        if (a.board_type !== b.board_type) return a.board_type.localeCompare(b.board_type);
        return a.order_index - b.order_index;
      })
    );
    return updated;
  };

  const persistBoardOrder = async (boardType: string, reordered: TeamMember[]) => {
    const updated = mergeBoardOrder(boardType, reordered);

    for (const member of updated) {
      const { error } = await supabase
        .from("team_members")
        .update({ order_index: member.order_index })
        .eq("id", member.id);
      if (error) throw error;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent, boardType: string) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const boardMembers = members.filter((m) => m.board_type === boardType);
    const oldIndex = boardMembers.findIndex((m) => m.id === active.id);
    const newIndex = boardMembers.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(boardMembers, oldIndex, newIndex);

    try {
      await persistBoardOrder(boardType, reordered);
      toast({ title: "Order updated", description: "Team member position saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save new order", variant: "destructive" });
      fetchMembers();
    }
  };

  const handleMoveUp = async (item: TeamMember) => {
    const boardMembers = members.filter((m) => m.board_type === item.board_type);
    const currentIndex = boardMembers.findIndex((m) => m.id === item.id);
    if (currentIndex <= 0) return;

    const reordered = arrayMove(boardMembers, currentIndex, currentIndex - 1);
    try {
      await persistBoardOrder(item.board_type, reordered);
      toast({ title: "Moved up" });
    } catch {
      toast({ title: "Error", description: "Failed to move member", variant: "destructive" });
      fetchMembers();
    }
  };

  const handleMoveDown = async (item: TeamMember) => {
    const boardMembers = members.filter((m) => m.board_type === item.board_type);
    const currentIndex = boardMembers.findIndex((m) => m.id === item.id);
    if (currentIndex === -1 || currentIndex >= boardMembers.length - 1) return;

    const reordered = arrayMove(boardMembers, currentIndex, currentIndex + 1);
    try {
      await persistBoardOrder(item.board_type, reordered);
      toast({ title: "Moved down" });
    } catch {
      toast({ title: "Error", description: "Failed to move member", variant: "destructive" });
      fetchMembers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      const { error } = await supabase.from("team_members").update(formData).eq("id", editingItem.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Team member updated" });
    } else {
      const boardMembers = members.filter((m) => m.board_type === formData.board_type);
      const maxOrder = Math.max(...boardMembers.map((m) => m.order_index), -1);
      const { error } = await supabase
        .from("team_members")
        .insert({ ...formData, order_index: maxOrder + 1 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Team member created" });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    resetForm();
    fetchMembers();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      qualifications: "",
      avatar_url: "",
      board_type: "management",
      whatsapp_number: "",
      imo_number: "",
    });
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      qualifications: item.qualifications || "",
      avatar_url: item.avatar_url || "",
      board_type: item.board_type,
      whatsapp_number: item.whatsapp_number || "",
      imo_number: item.imo_number || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    toast({ title: "Success", description: "Team member deleted" });
    fetchMembers();
  };

  const toggleActive = async (item: TeamMember) => {
    await supabase.from("team_members").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchMembers();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const managementMembers = members.filter((m) => m.board_type === "management");
  const shariahMembers = members.filter((m) => m.board_type === "shariah");
  const activeMember = activeId ? members.find((m) => m.id === activeId) : null;

  const renderMemberTable = (membersList: TeamMember[], title: string, boardType: string) => (
    <div>
      <h4 className="font-medium mb-2">{title} ({membersList.length})</h4>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(e) => handleDragEnd(e, boardType)}
        onDragCancel={() => setActiveId(null)}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Move</TableHead>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>IMO</TableHead>
              <TableHead className="max-w-[200px]">Qualifications</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContext items={membersList.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <TableBody>
              {membersList.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  position={index + 1}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={toggleActive}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === membersList.length - 1}
                />
              ))}
            </TableBody>
          </SortableContext>
        </Table>
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeMember && activeMember.board_type === boardType ? (
            <DragPreview item={activeMember} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Drag rows using the grip handle, or use arrow buttons to move members up/down. Order updates the public team section.
          </CardDescription>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                value={formData.avatar_url}
                onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                onUpload={uploadImage}
                uploading={uploading}
                label="Avatar Image"
              />
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role/Title *</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  placeholder="e.g., Chairman, Director"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Board Type</label>
                <Select
                  value={formData.board_type}
                  onValueChange={(v) => setFormData({ ...formData, board_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management Board</SelectItem>
                    <SelectItem value="shariah">Shariah Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Qualifications / Bio</label>
                <Textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  rows={3}
                  placeholder="e.g., Honours Islamic Studies, National University, Bangladesh"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This appears on hover overlay on the team section
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp Number</label>
                <Input
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="e.g., +8801712345678"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shows on card for management board members
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">IMO Number</label>
                <Input
                  value={formData.imo_number}
                  onChange={(e) => setFormData({ ...formData, imo_number: e.target.value })}
                  placeholder="e.g., +8801712345678"
                />
                <p className="text-xs text-muted-foreground mt-1">Shows on card alongside WhatsApp</p>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {editingItem ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderMemberTable(managementMembers, "Management Board", "management")}
        {renderMemberTable(shariahMembers, "Shariah Board", "shariah")}
      </CardContent>
    </Card>
  );
};

export default AdminTeam;
