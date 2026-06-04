import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

interface Tile {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  image_url: string | null;
  href: string;
  color_class: string;
  bg_class: string;
  order_index: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  { value: "hajj", label: "Kaaba / Hajj" },
  { value: "umrah", label: "Mosque / Umrah" },
  { value: "visa", label: "Plane / Visa" },
];

const COLOR_PRESETS = [
  { label: "Emerald (Green)", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  { label: "Blue", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { label: "Amber (Gold)", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
  { label: "Rose (Red)", color: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
  { label: "Purple", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
];

const blankTile: Omit<Tile, "id"> = {
  title: "",
  subtitle: "",
  icon: "hajj",
  image_url: "",
  href: "#",
  color_class: "text-emerald-600",
  bg_class: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
  order_index: 99,
  is_active: true,
};

const AdminHeroServiceTiles = () => {
  const { toast } = useToast();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("hero_service_tiles")
      .select("*")
      .order("order_index");
    if (error) {
      toast({ title: "Failed to load tiles", description: error.message, variant: "destructive" });
    } else {
      setTiles(data || []);
    }
    setLoading(false);
  };

  const updateLocal = (id: string, patch: Partial<Tile>) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const applyColorPreset = (id: string, preset: typeof COLOR_PRESETS[number]) => {
    updateLocal(id, { color_class: preset.color, bg_class: preset.bg });
  };

  const saveTile = async (tile: Tile) => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("hero_service_tiles")
      .update({
        title: tile.title,
        subtitle: tile.subtitle,
        icon: tile.icon,
        image_url: tile.image_url || null,
        href: tile.href,
        color_class: tile.color_class,
        bg_class: tile.bg_class,
        order_index: tile.order_index,
        is_active: tile.is_active,
      })
      .eq("id", tile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tile saved" });
    }
  };

  const addTile = async () => {
    const nextOrder = (tiles[tiles.length - 1]?.order_index ?? 0) + 1;
    const { data, error } = await (supabase as any)
      .from("hero_service_tiles")
      .insert({ ...blankTile, title: "New Tile", order_index: nextOrder })
      .select()
      .single();
    if (error) {
      toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    } else {
      setTiles((prev) => [...prev, data]);
      toast({ title: "Tile added" });
    }
  };

  const deleteTile = async (id: string) => {
    if (!confirm("Delete this tile?")) return;
    const { error } = await (supabase as any).from("hero_service_tiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setTiles((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Tile deleted" });
    }
  };

  const move = async (id: string, direction: -1 | 1) => {
    const idx = tiles.findIndex((t) => t.id === id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= tiles.length) return;
    const a = tiles[idx];
    const b = tiles[swapIdx];
    const newOrderA = b.order_index;
    const newOrderB = a.order_index;
    await (supabase as any).from("hero_service_tiles").update({ order_index: newOrderA }).eq("id", a.id);
    await (supabase as any).from("hero_service_tiles").update({ order_index: newOrderB }).eq("id", b.id);
    fetchTiles();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading tiles...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hero Service Tiles</CardTitle>
        <Button onClick={addTile} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Tile
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          These are the tiles shown below the main hero banner (e.g. Hajj Packages, Umrah Packages, Visa Services).
          Use the link field with <code>#hajj</code>, <code>#umrah</code>, <code>#visa</code> to scroll to those sections.
        </p>

        {tiles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No tiles yet. Click "Add Tile" to create one.</p>
        )}

        {tiles.map((tile, idx) => (
          <div key={tile.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={tile.is_active}
                  onCheckedChange={(v) => updateLocal(tile.id, { is_active: v })}
                />
                <span className="text-sm text-muted-foreground">
                  {tile.is_active ? "Visible" : "Hidden"}
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => move(tile.id, -1)}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={idx === tiles.length - 1} onClick={() => move(tile.id, 1)}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteTile(tile.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input value={tile.title} onChange={(e) => updateLocal(tile.id, { title: e.target.value })} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={tile.subtitle || ""} onChange={(e) => updateLocal(tile.id, { subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Link / Anchor</Label>
                <Input
                  value={tile.href}
                  onChange={(e) => updateLocal(tile.id, { href: e.target.value })}
                  placeholder="#hajj"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={tile.icon} onValueChange={(v) => updateLocal(tile.id, { icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Color Preset</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyColorPreset(tile.id, p)}
                      className={`px-3 py-1 rounded border text-xs ${p.bg} ${p.color} ${
                        tile.color_class === p.color ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={() => saveTile(tile)} disabled={saving} size="sm" className="w-full">
              <Save className="w-4 h-4 mr-1" />
              {saving ? "Saving..." : "Save This Tile"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminHeroServiceTiles;
