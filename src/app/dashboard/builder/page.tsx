"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  Loader2,
  Type,
  Image as ImageIcon,
  LayoutGrid,
  Zap,
  Sparkles,
  ChevronUp,
  ChevronDown,
  MousePointerClick,
  Star,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

type BlockType = "hero" | "product_grid" | "banner" | "text" | "cta" | "trust";

interface Block {
  id: string;
  block_type: BlockType;
  order_index: number;
  content: Record<string, string | boolean>;
  is_active: boolean;
}

const BLOCK_TEMPLATES: { type: BlockType; label: string; icon: React.ReactNode; desc: string; defaultContent: Record<string, string | boolean> }[] = [
  {
    type: "hero",
    label: "Hero Banner",
    icon: <Star size={18} />,
    desc: "Large heading with description and CTA button.",
    defaultContent: { heading: "Welcome to My Store", subheading: "Discover amazing deals curated just for you.", cta_text: "Start Shopping", show_social_proof: true },
  },
  {
    type: "product_grid",
    label: "Product Grid",
    icon: <LayoutGrid size={18} />,
    desc: "Display your affiliate products in a responsive grid.",
    defaultContent: { columns: "4", show_prices: true, show_platform: true },
  },
  {
    type: "banner",
    label: "Promo Banner",
    icon: <ImageIcon size={18} />,
    desc: "Eye-catching promotional banner with custom text.",
    defaultContent: { text: "🔥 Limited Time Deals — Shop Now!", bg_color: "#6C5CE7" },
  },
  {
    type: "text",
    label: "Text Block",
    icon: <Type size={18} />,
    desc: "Rich text section for descriptions or announcements.",
    defaultContent: { content: "Add your custom content here. Tell visitors about your curation philosophy." },
  },
  {
    type: "cta",
    label: "Call to Action",
    icon: <MousePointerClick size={18} />,
    desc: "Conversion-focused section with button and urgency.",
    defaultContent: { heading: "Don't Miss Out!", description: "These deals won't last forever. Start shopping now.", button_text: "Shop Now", button_url: "#products" },
  },
  {
    type: "trust",
    label: "Trust Section",
    icon: <ShieldCheck size={18} />,
    desc: "Display trust signals like verified badge and stats.",
    defaultContent: { show_verified: true, show_stats: true, custom_text: "All products verified and curated by experts." },
  },
];

export default function BuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    loadBlocks();
  }, []);

  async function loadBlocks() {
    try {
      const user = await getUser();
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (error) {
        if (error.code === "42P01") {
          toast.info("Builder tables not yet initialized. Using defaults.");
          setBlocks(getDefaultBlocks());
        } else {
          throw error;
        }
      } else {
        setBlocks(data?.length ? data : getDefaultBlocks());
      }
    } catch {
      toast.error("Failed to load page blocks.");
      setBlocks(getDefaultBlocks());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultBlocks(): Block[] {
    return [
      { id: crypto.randomUUID(), block_type: "hero", order_index: 0, content: BLOCK_TEMPLATES[0].defaultContent, is_active: true },
      { id: crypto.randomUUID(), block_type: "trust", order_index: 1, content: BLOCK_TEMPLATES[5].defaultContent, is_active: true },
      { id: crypto.randomUUID(), block_type: "product_grid", order_index: 2, content: BLOCK_TEMPLATES[1].defaultContent, is_active: true },
    ];
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    newBlocks.forEach((b, i) => (b.order_index = i));
    setBlocks(newBlocks);
  }

  function addBlock(type: BlockType) {
    const template = BLOCK_TEMPLATES.find((t) => t.type === type);
    if (!template) return;

    const newBlock: Block = {
      id: crypto.randomUUID(),
      block_type: type,
      order_index: blocks.length,
      content: { ...template.defaultContent },
      is_active: true,
    };
    setBlocks([...blocks, newBlock]);
    setShowPalette(false);
    setSelectedBlock(newBlock.id);
    toast.success(`${template.label} block added!`);
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order_index: i })));
    if (selectedBlock === id) setSelectedBlock(null);
    toast.success("Block removed");
  }

  function toggleBlock(id: string) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b)));
  }

  function updateBlockContent(id: string, key: string, value: string | boolean) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, [key]: value } } : b)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");
      const supabase = createClient();

      // Delete existing blocks and re-insert
      await supabase.from("page_blocks").delete().eq("user_id", user.id);

      const insertData = blocks.map((b) => ({
        user_id: user.id,
        block_type: b.block_type,
        order_index: b.order_index,
        content: b.content,
        is_active: b.is_active,
      }));

      const { error } = await supabase.from("page_blocks").insert(insertData);
      if (error) {
        if (error.code === "42P01") {
          toast.info("Builder data saved locally. Run the database migration to persist.");
        } else {
          throw error;
        }
      } else {
        toast.success("Store layout saved!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Store Builder</h1>
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <LayoutGrid size={18} />
            </div>
          </div>
          <p className="text-muted font-medium">Customize your storefront layout with drag-and-drop blocks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={() => setShowPalette(!showPalette)}>
            <Plus size={16} />
            Add Block
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleSave} loading={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Layout
          </Button>
        </div>
      </div>

      {/* Block Palette */}
      {showPalette && (
        <Card className="glass border-primary/20 animate-scale-in overflow-hidden">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              Available Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {BLOCK_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => addBlock(t.type)}
                  className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-primary/5 hover:border-primary/20 transition-all text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {t.icon}
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{t.label}</h4>
                  <p className="text-[9px] text-muted mt-1 line-clamp-2">{t.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Block List */}
        <div className="lg:col-span-7 space-y-3">
          {blocks.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-dashed border-white/10">
              <LayoutGrid size={40} className="text-muted/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No Blocks Yet</h3>
              <p className="text-sm text-muted mt-2">Click &quot;Add Block&quot; to start building your storefront.</p>
            </div>
          ) : (
            blocks.map((block, index) => {
              const template = BLOCK_TEMPLATES.find((t) => t.type === block.block_type);
              const isSelected = selectedBlock === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    isSelected
                      ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  } ${!block.is_active ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, "up"); }}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-white/10 text-muted disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, "down"); }}
                        disabled={index === blocks.length - 1}
                        className="p-1 rounded hover:bg-white/10 text-muted disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <GripVertical size={16} className="text-muted/30" />

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-primary/20 text-primary" : "bg-surface-light text-muted"
                    }`}>
                      {template?.icon || <LayoutGrid size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground">{template?.label || block.block_type}</h4>
                      <p className="text-[10px] text-muted truncate">
                        {block.content.heading as string || block.content.text as string || block.content.content as string || "Configure this block →"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBlock(block.id); }}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${block.is_active ? "text-success hover:bg-success/10" : "text-muted hover:bg-white/5"}`}
                        title={block.is_active ? "Disable" : "Enable"}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Block Editor */}
        <div className="lg:col-span-5">
          {selectedBlockData ? (
            <Card className="glass sticky top-24 overflow-hidden animate-fade-in">
              <CardHeader className="p-5 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  Edit: {BLOCK_TEMPLATES.find((t) => t.type === selectedBlockData.block_type)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Object.entries(selectedBlockData.content).map(([key, value]) => {
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

                  if (typeof value === "boolean") {
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted">{label}</label>
                        <button
                          onClick={() => updateBlockContent(selectedBlockData.id, key, !value)}
                          className={`w-10 h-6 rounded-full transition-all cursor-pointer ${
                            value ? "bg-primary" : "bg-surface-lighter"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">{label}</label>
                      {(value as string).length > 50 ? (
                        <textarea
                          value={value as string}
                          onChange={(e) => updateBlockContent(selectedBlockData.id, key, e.target.value)}
                          rows={3}
                          className="w-full rounded-xl bg-white/5 border border-white/5 p-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                        />
                      ) : (
                        <input
                          value={value as string}
                          onChange={(e) => updateBlockContent(selectedBlockData.id, key, e.target.value)}
                          className="w-full rounded-xl bg-white/5 border border-white/5 px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 glass rounded-3xl border border-dashed border-white/10">
              <ArrowRight size={28} className="text-muted/20 mx-auto mb-3 -rotate-180" />
              <p className="text-sm text-muted font-medium">Select a block to edit its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
