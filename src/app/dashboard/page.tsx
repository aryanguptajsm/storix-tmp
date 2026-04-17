import Image from "next/image";
import { 
  DashboardEntrance, 
  ScrollReveal, 
  StaggerReveal, 
  TiltCard 
} from "@/components/dashboard/DashboardClientWrapper";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // Check if database is initialized
  const { error: probeError } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  let configError = false;
  let productsTableExists = true;

  if (probeError && probeError.code === "PGRST205") {
    productsTableExists = false;
  } else if (probeError && probeError.message.includes("Invalid API key")) {
    configError = true;
  }

  let profile = null;
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  profile = existingProfile;

  // Auto-initialize profile
  if (!profile && !configError && productsTableExists) {
    const { data: newProfile, error: initError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: (user.email?.split("@")[0].toLowerCase() || "user") + "_" + user.id.slice(0, 5),
        store_name: (user.email?.split("@")[0] || "My") + "'s Store",
      })
      .select()
      .single();
    
    if (!initError) profile = newProfile;
  }

  // Fetch stats and recent products in parallel
  const [productsRes, clicksRes, recentRes] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("clicks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  if (productsRes.error || clicksRes.error) {
     if (productsRes.error?.message.includes("key") || clicksRes.error?.message.includes("key")) {
       configError = true;
     }
  }

  const stats = {
    totalProducts: productsRes.count || 0,
    totalClicks: clicksRes.count || 0,
  };
  const recentProducts = recentRes.data || [];

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      {/* Background Layering */}
      <div className="fixed inset-0 pointer-events-none -z-20 bg-[#020205]" />
      <div className="fixed inset-0 noise-subtle opacity-70 pointer-events-none -z-10" />
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-breathing" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-drift-slow" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <DashboardEntrance />

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {configError && (
            <ScrollReveal delay={0.1}>
              <div className="p-6 rounded-2xl border border-warning/30 bg-warning/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-warning/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center text-warning shadow-sm border border-warning/20">
                     <Settings size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Configuration Required</h3>
                    <p className="text-muted/80 text-sm max-w-md font-medium mt-0.5">Your database nodes are disconnected. Re-establish connection via environment variable mapping.</p>
                  </div>
                </div>
                <Link href="https://supabase.com/dashboard/project/lnckyrvxehzcjvyultkd/settings/api" target="_blank" className="w-full md:w-auto relative z-10">
                   <Button className="w-full md:w-auto h-11 px-6 gap-2 bg-warning hover:bg-warning-dark text-black font-bold uppercase tracking-wider rounded-xl">
                     <ExternalLink size={16} />
                     Access API Console
                   </Button>
                </Link>
              </div>
            </ScrollReveal>
          )}

          {!configError && !productsTableExists && (
            <ScrollReveal delay={0.1}>
              <div className="p-6 rounded-2xl border border-danger/30 bg-danger/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-danger/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center text-danger shadow-sm border border-danger/20">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">System Offline</h3>
                    <p className="text-muted/80 text-sm max-w-md font-medium mt-0.5">Your merchant grid database has not been initialized. Execute the SQL protocol to begin.</p>
                  </div>
                </div>
                <Link href="/dashboard/setup" className="w-full md:w-auto relative z-10">
                   <Button variant="danger" className="w-full md:w-auto h-11 px-6 gap-2 bg-danger font-bold uppercase tracking-wider rounded-xl transition-all">
                     <ArrowRight size={16} />
                     Run Setup Script
                   </Button>
                </Link>
              </div>
            </ScrollReveal>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-secondary-light block mt-1">
                   {profile?.store_name || "there"}
                </span>
              </h1>
              <p className="text-sm text-white/40 font-medium">
                Here&apos;s an overview of your affiliate store performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <CopyLinkButton username={profile?.username || ""} />
              <Link href={`/store/${profile?.username?.toLowerCase()}`} target="_blank" className="flex-1 lg:flex-initial">
                <Button variant="secondary" className="w-full bg-white/[0.03] border-white/5 h-10 px-5 text-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Store
                </Button>
              </Link>
              <Link href="/dashboard/add-product" className="w-full sm:w-auto flex-1 lg:flex-initial">
                <Button className="w-full h-10 px-6 text-sm shadow-lg shadow-primary/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="glass" className="relative overflow-hidden group hover:glow-primary transition-all duration-300 h-full border-white/[0.05]">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 icon-glow-primary rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.02] px-5 pt-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted/60">
                Products
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Package className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3 relative z-10">
              <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-500 origin-left">
                {stats.totalProducts}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%] animate-shimmer" />
                </div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group hover:glow-secondary transition-all duration-300 h-full border-white/[0.05]">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 icon-glow-secondary rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.02] px-5 pt-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted/60">
                Total Clicks
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 group-hover:scale-105 transition-transform duration-300">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3 relative z-10">
              <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-500 origin-left">
                {stats.totalClicks}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[45%] animate-shimmer" />
                </div>
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Tracked</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group hover:glow-accent transition-all duration-300 h-full border-white/[0.05]">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 icon-glow-accent rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.02] px-5 pt-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted/60">
                Est. Revenue
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3 relative z-10">
              <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-500 origin-left">
                $0.00
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[20%] animate-shimmer" />
                </div>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card variant="premium" className="shadow-lg relative group transition-all duration-500 overflow-hidden border-white/[0.05] p-5 md:p-6 rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-primary border border-primary/20 shadow-md transition-all group-hover:scale-105 duration-500 relative overflow-hidden">
                   <div className="absolute inset-0 grid-bg-dots opacity-30" />
                   <Globe size={20} className="relative z-10" />
                </div>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Your Store</h3>
                    <div className="flex justify-center md:justify-start">
                       <span className="px-2 py-0.5 rounded-[4px] bg-success/10 text-success text-[9px] font-bold uppercase tracking-widest border border-success/20">Live</span>
                    </div>
                </div>
                <p className="text-xs text-white/50 font-medium max-w-lg leading-relaxed">
                   Your storefront is live. Share the link to start earning.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full lg:w-auto py-2.5 px-4 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-primary-light flex items-center justify-between gap-4 shadow-inner hover:border-primary/30 transition-all duration-300">
                 <span className="opacity-40">/store/</span>
                 <span className="font-bold tracking-tight">{profile?.username || "..."}</span>
              </div>
              <Link href={`/store/${profile?.username}`} target="_blank" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-10 rounded-lg px-6 text-xs gap-2">
                   <span>Visit Store</span>
                   <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card variant="glass" className="hover:border-white/10 transition-all duration-500 overflow-hidden group h-full rounded-2xl border-white/[0.05]">
            <CardHeader className="border-b border-white/[0.02] flex flex-row items-center justify-between pb-3 pt-4 px-5">
              <CardTitle className="text-[13px] font-bold tracking-tight uppercase text-muted/80">Recent Products</CardTitle>
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm" className="text-[9px] text-primary-light hover:text-primary font-bold uppercase tracking-widest border border-transparent hover:border-white/5 rounded-lg px-2 h-7 py-0 mt-[-4px]">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentProducts.length === 0 ? (
                <div className="text-xs text-muted text-center py-10 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center opacity-50 border border-white/5">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="max-w-[200px] font-medium text-white/40 text-[11px]">No products yet. Add your first product.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="p-4 flex items-center justify-between group/item hover:bg-white/[0.03] transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 relative border border-white/10 group-hover/item:scale-105 transition-transform duration-300 shadow-sm p-1">
                          {product.image_url ? (
                            <Image src={product.image_url} alt="" fill className="object-contain p-1" sizes="40px" />
                          ) : (
                            <Package className="w-full h-full p-2 text-muted/20" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground line-clamp-1 group-hover/item:text-primary transition-colors tracking-tight">{product.title}</span>
                          <span className="text-[9px] text-muted uppercase font-bold tracking-wider flex items-center gap-1 mt-0.5">
                             <Globe size={8} className="text-secondary" /> {product.platform}
                          </span>
                        </div>
                      </div>
                      <div className="text-right relative z-10 pl-3">
                        <div className="text-sm font-bold text-secondary-light tracking-tight">{product.price || "N/A"}</div>
                        <div className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">{new Date(product.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" className="hover:border-white/10 transition-all duration-500 h-full group rounded-2xl border-white/[0.05]">
            <CardHeader className="border-b border-white/[0.02] pb-3 pt-4 px-5">
              <CardTitle className="text-[13px] font-bold tracking-tight uppercase text-muted/80">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-primary/20 transition-all group/tip cursor-default hover:bg-primary/[0.02] relative overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover/tip:rotate-6 transition-transform border border-primary/20 shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-[13px] text-foreground mb-0.5">Add More Products</h4>
                  <p className="text-[11px] text-muted/70 leading-relaxed font-medium">
                    Stores with <span className="text-primary-light font-bold">12+ products</span> get significantly more clicks.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:border-secondary/20 transition-all group/tip cursor-default hover:bg-secondary/[0.02] relative overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary group-hover/tip:rotate-6 transition-transform border border-secondary/20 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-[13px] text-foreground mb-0.5">Optimize Your Titles</h4>
                  <p className="text-[11px] text-muted/70 leading-relaxed font-medium">
                    Use the <span className="text-secondary-light font-bold">AI generator</span> to write SEO-friendly titles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
