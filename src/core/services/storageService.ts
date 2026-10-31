/**
 * ADAPTER LƯU TRỮ DỮ LIỆU LAI (HYBRID STORAGE SERVICE)
 * Tự động chuyển đổi giữa Supabase Cloud (khi đăng nhập & có cấu hình)
 * và LocalStorage Offline (chế độ Demo / Khách vãng lai / Không có mạng).
 */

import type { CutlistPart, FeatureLead, MaterialItem, SavedProject, WorkshopProfile } from "../types/index.ts";
import { SEED_MATERIALS, SEED_PROFILE, SEED_PROJECTS } from "./seedData.ts";
import { createClient, isSupabaseConfigured } from "../supabase/client.ts";
import { resolveProjectProfitMargin } from "../calculations/profit-calculator.ts";
import { validateAndSanitizeCostConfig } from "../calculations/cost-config-validator.ts";

const STORAGE_KEYS = {
  STATE: "noithat_pro_state_v1",
  PROFILE: "noithat_pro_profile",
  MATERIALS: "noithat_pro_materials",
  PROJECTS: "noithat_pro_projects",
  LEADS: "noithat_pro_leads",
};

let memoryState: StorageDataState | null = null;

export interface StorageDataState {
  profile: WorkshopProfile;
  materials: MaterialItem[];
  projects: SavedProject[];
}

export class StorageService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // ==========================================================================
  // LOCAL STORAGE FALLBACK HELPERS
  // ==========================================================================

  public static getLocalState(): StorageDataState {
    if (!this.isBrowser()) {
      if (!memoryState) {
        memoryState = {
          profile: { ...SEED_PROFILE },
          materials: [...SEED_MATERIALS],
          projects: [...SEED_PROJECTS],
        };
      }
      return memoryState;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          profile: parsed.profile ? { ...SEED_PROFILE, ...parsed.profile } : SEED_PROFILE,
          materials: (() => {
            if (!Array.isArray(parsed.materials) || parsed.materials.length === 0) {
              return SEED_MATERIALS;
            }
            const existingCodes = new Set(parsed.materials.map((m: MaterialItem) => m.code));
            const enrichedExisting = parsed.materials.map((m: MaterialItem) => {
              const seed = SEED_MATERIALS.find((s) => s.code === m.code);
              return seed
                ? {
                    ...m,
                    brand: m.brand || seed.brand,
                    surface: m.surface || seed.surface,
                    coreStandard: m.coreStandard || seed.coreStandard,
                    name: m.name.includes("An Cường") ? m.name : seed.name,
                  }
                : m;
            });
            const newSeeds = SEED_MATERIALS.filter((s) => !existingCodes.has(s.code));
            return [...enrichedExisting, ...newSeeds];
          })(),
          projects: Array.isArray(parsed.projects)
            ? parsed.projects.map((proj: SavedProject) => ({
                ...proj,
                profitMargin: resolveProjectProfitMargin(proj.profitMargin),
                calcVersion: proj.calcVersion ?? 1,
              }))
            : SEED_PROJECTS,
        };
      }
    } catch (e) {
      console.warn("Không thể đọc LocalStorage:", e);
    }

    return {
      profile: SEED_PROFILE,
      materials: SEED_MATERIALS,
      projects: SEED_PROJECTS,
    };
  }

  public static setLocalState(state: StorageDataState): void {
    memoryState = state;
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    } catch (e) {
      console.error("Không thể ghi vào LocalStorage:", e);
    }
  }

  // ==========================================================================
  // PROFILE OPERATIONS
  // ==========================================================================

  public static async getProfile(): Promise<WorkshopProfile> {
    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            let subscriptionTier = data.subscription_tier || "free";
            if (data.active_org_id) {
              const { data: sub } = await supabase
                .from("subscriptions")
                .select("tier")
                .eq("org_id", data.active_org_id)
                .single();
              if (sub?.tier) {
                subscriptionTier = sub.tier;
              }
            }

            return {
              name: data.company_name || SEED_PROFILE.name,
              companyName: data.company_name,
              phone: data.phone || SEED_PROFILE.phone,
              address: data.address || SEED_PROFILE.address,
              logoUrl: data.logo_url || "",
              subscriptionTier,
              quoteTerms: SEED_PROFILE.quoteTerms,
              bankName: SEED_PROFILE.bankName,
              accountNumber: SEED_PROFILE.accountNumber,
              accountName: SEED_PROFILE.accountName,
              updatedAt: data.updated_at,
            };
          }
        }
      } catch (err) {
        console.warn("Lỗi truy vấn Supabase Profile, chuyển sang LocalStorage:", err);
      }
    }

    return this.getLocalState().profile;
  }

  public static async saveProfile(profile: WorkshopProfile): Promise<{ success: boolean; error?: string }> {
    // 1. Luôn cập nhật LocalStorage trước để phản hồi tức thì
    const sanitizedCostConfig = validateAndSanitizeCostConfig(profile.costConfig);
    const sanitizedProfile: WorkshopProfile = {
      ...profile,
      costConfig: sanitizedCostConfig,
    };

    const current = this.getLocalState();
    current.profile = sanitizedProfile;
    this.setLocalState(current);

    // 2. Đồng bộ lên Supabase nếu có phiên làm việc
    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const profilePayload: Record<string, any> = {
            company_name: sanitizedProfile.name,
            phone: sanitizedProfile.phone,
            address: sanitizedProfile.address,
            logo_url: sanitizedProfile.logoUrl,
            updated_at: new Date().toISOString(),
            cost_config: sanitizedCostConfig,
          };

          // Dùng .update() thay vì .upsert() vì bảng profiles đã REVOKE INSERT đối với authenticated users
          // Hàng profiles gốc được tạo tự động bởi database trigger khi người dùng đăng ký auth.users
          const { data, error } = await supabase
            .from("profiles")
            .update(profilePayload)
            .eq("id", user.id)
            .select("id");

          if (error) {
            console.error("Lỗi đồng bộ Supabase Profile:", error);
            return { success: false, error: error.message };
          }

          if (!data || data.length === 0) {
            return {
              success: false,
              error: "Hồ sơ chưa được tạo trên Cloud. Vui lòng liên hệ quản trị viên.",
            };
          }
        }
      } catch (err: any) {
        console.error("Lỗi đồng bộ Supabase Profile:", err);
        return { success: false, error: err?.message || "Lỗi kết nối Supabase Cloud" };
      }
    }

    return { success: true };
  }

  // ==========================================================================
  // MATERIALS LIBRARY OPERATIONS
  // ==========================================================================

  public static async getMaterials(): Promise<MaterialItem[]> {
    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("materials_library")
            .select("*")
            .eq("user_id", user.id);

          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map((d: any) => ({
              id: d.id,
              code: d.code,
              name: d.name,
              category: d.category,
              unit: d.unit,
              standardLengthMm: Number(d.standard_length_mm || 2440),
              standardWidthMm: Number(d.standard_width_mm || 1220),
              thicknessMm: Number(d.thickness_mm || 17),
              standardLength: Number(d.standard_length_mm || 2440),
              standardWidth: Number(d.standard_width_mm || 1220),
              thickness: Number(d.thickness_mm || 17),
              unitPrice: Number(d.unit_price || 0),
              wasteFactor: Number(d.waste_factor || 1.15),
            }));
          }
        }
      } catch (err) {
        console.warn("Lỗi truy vấn Supabase Materials, chuyển sang LocalStorage:", err);
      }
    }

    return this.getLocalState().materials;
  }

  public static async saveMaterials(materials: MaterialItem[]): Promise<void> {
    const current = this.getLocalState();
    current.materials = materials;
    this.setLocalState(current);

    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Ghi đè thư viện vật tư của user
          const rows = materials.map((m) => ({
            id: m.id.startsWith("mat-") ? undefined : m.id,
            user_id: user.id,
            category: m.category,
            code: m.code,
            name: m.name,
            unit: m.unit,
            standard_length_mm: m.standardLengthMm ?? m.standardLength ?? 2440,
            standard_width_mm: m.standardWidthMm ?? m.standardWidth ?? 1220,
            thickness_mm: m.thicknessMm ?? m.thickness ?? 17,
            unit_price: m.unitPrice,
            waste_factor: m.wasteFactor,
          }));

          await supabase.from("materials_library").upsert(rows);
        }
      } catch (err) {
        console.error("Lỗi đồng bộ Supabase Materials:", err);
      }
    }
  }

  // ==========================================================================
  // PROJECTS OPERATIONS
  // ==========================================================================

  public static async getProjects(): Promise<SavedProject[]> {
    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("projects")
            .select("*, project_items(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map((p: any) => ({
              id: p.id,
              projectName: p.project_name,
              clientName: p.client_name || "",
              clientPhone: p.client_phone || "",
              clientAddress: p.client_address || "",
              createdAt: p.created_at,
              status: p.status || "draft",
              profitMargin: resolveProjectProfitMargin(p.profit_margin),
              roundingStep: 0.5,
              totalCost: Number(p.total_cost || 0),
              totalQuote: Number(p.total_quote || 0),
              calcVersion: p.calc_version ?? 1,
              materialsSnapshot: SEED_MATERIALS,
              items: (p.project_items || []).map((item: any) => ({
                id: item.id,
                moduleName: item.module_name,
                partName: item.part_name,
                lengthMm: Number(item.length_mm),
                widthMm: Number(item.width_mm),
                thicknessMm: Number(item.thickness_mm),
                length: Number(item.length_mm),
                width: Number(item.width_mm),
                thickness: Number(item.thickness_mm),
                qty: Number(item.qty),
                materialCode: item.material_code,
                edgeL1: Boolean(item.edge_l1),
                edgeL2: Boolean(item.edge_l2),
                edgeW1: Boolean(item.edge_w1),
                edgeW2: Boolean(item.edge_w2),
              })),
            }));
          }
        }
      } catch (err) {
        console.warn("Lỗi truy vấn Supabase Projects, chuyển sang LocalStorage:", err);
      }
    }

    return this.getLocalState().projects;
  }

  public static async saveProject(project: SavedProject): Promise<{ success: boolean; error?: string }> {
    const current = this.getLocalState();
    const existing = current.projects.find((p) => p.id === project.id);
    const resolvedCalcVersion = 1;
    const sanitizedCostConfigSnapshot = validateAndSanitizeCostConfig(project.costConfigSnapshot);
    const projectWithVersion: SavedProject = {
      ...project,
      calcVersion: resolvedCalcVersion,
      costConfigSnapshot: sanitizedCostConfigSnapshot,
    };

    current.projects = existing
      ? current.projects.map((p) => (p.id === project.id ? projectWithVersion : p))
      : [projectWithVersion, ...current.projects];
    this.setLocalState(current);

    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Phân giải org_id của người dùng hiện tại
          let orgId = (project as any).orgId;
          if (!orgId) {
            const { data: profData } = await supabase
              .from("profiles")
              .select("active_org_id")
              .eq("id", user.id)
              .single();
            orgId = profData?.active_org_id;
          }

          // Kiểm tra xung đột sửa đổi đồng thời trên 2 thiết bị (Optimistic Concurrency Control)
          if (project.id && !project.id.startsWith("proj-")) {
            const { data: serverProj } = await supabase
              .from("projects")
              .select("updated_at")
              .eq("id", project.id)
              .single();

            if (serverProj && project.updatedAt) {
              const serverTime = new Date(serverProj.updated_at).getTime();
              const clientTime = new Date(project.updatedAt).getTime();
              if (serverTime > clientTime) {
                console.warn("Phát hiện xung đột phiên bản dự án giữa các thiết bị");
              }
            }
          }

          // Lưu dự án: chỉ map các trường khớp với schema database thực tế
          const projectPayload: Record<string, any> = {
            id: project.id.startsWith("proj-") ? undefined : project.id,
            user_id: user.id,
            project_name: project.projectName,
            client_name: project.clientName,
            client_phone: project.clientPhone,
            client_address: project.clientAddress,
            status: project.status,
            profit_margin: project.profitMargin,
            total_cost: project.totalCost,
            total_quote: project.totalQuote,
            rounding_step: project.roundingStep ?? 0.5,
            materials_snapshot: project.materialsSnapshot || project.materialSnapshots,
            cost_config_snapshot: sanitizedCostConfigSnapshot,
            sections_snapshot: (project as any).sectionsSnapshot || (project as any).sections,
            calc_version: resolvedCalcVersion,
            updated_at: new Date().toISOString(),
          };

          if (orgId) {
            projectPayload.org_id = orgId;
          }

          const { data: savedProj, error: projErr } = await supabase
            .from("projects")
            .upsert(projectPayload)
            .select()
            .single();

          if (projErr) {
            console.error("Lỗi đồng bộ Supabase Project:", projErr);
            return { success: false, error: projErr.message };
          }

          if (savedProj) {
            // Lưu các chi tiết tấm (project_items)
            const items = project.items.map((item) => ({
              project_id: savedProj.id,
              user_id: user.id,
              module_name: item.moduleName,
              part_name: item.partName,
              length_mm: item.lengthMm ?? item.length ?? 0,
              width_mm: item.widthMm ?? item.width ?? 0,
              thickness_mm: item.thicknessMm ?? item.thickness ?? 17,
              qty: item.qty,
              material_code: item.materialCode,
              edge_l1: item.edgeL1,
              edge_l2: item.edgeL2,
              edge_w1: item.edgeW1,
              edge_w2: item.edgeW2,
            }));

            // Xóa cũ và nạp mới items
            const { error: delErr } = await supabase.from("project_items").delete().eq("project_id", savedProj.id);
            if (delErr) {
              console.error("Lỗi xóa project_items cũ:", delErr);
              return { success: false, error: delErr.message };
            }

            const { error: insErr } = await supabase.from("project_items").insert(items);
            if (insErr) {
              console.error("Lỗi thêm mới project_items:", insErr);
              return { success: false, error: insErr.message };
            }
          }
        }
      } catch (err: any) {
        console.error("Lỗi đồng bộ Supabase Project:", err);
        return { success: false, error: err?.message || "Lỗi kết nối Supabase Cloud" };
      }
    }

    return { success: true };
  }

  public static async deleteProject(id: string): Promise<void> {
    const current = this.getLocalState();
    current.projects = current.projects.filter((p) => p.id !== id);
    this.setLocalState(current);

    if (this.isBrowser() && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("projects").delete().eq("id", id);
      } catch (err) {
        console.error("Lỗi xóa project trên Supabase:", err);
      }
    }
  }

  // ==========================================================================
  // MARKETING LEADS OPERATIONS (ĐĂNG KÝ NHẬN TƯ VẤN / TẢI TÀI LIỆU)
  // ==========================================================================

  public static async saveLead(lead: { email?: string; phone?: string; source: string }): Promise<void> {
    const fullLead: FeatureLead = {
      ...lead,
      id: "lead-" + Date.now(),
      createdAt: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
        const leads: FeatureLead[] = raw ? JSON.parse(raw) : [];
        leads.push(fullLead);
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      } catch (e) {
        console.warn("Lỗi lưu lead LocalStorage:", e);
      }
    }
  }

  // ==========================================================================
  // SYNC & ORGANIZATION MULTI-TENANCY HELPERS (PHASE C3)
  // ==========================================================================

  /**
   * Đồng bộ toàn bộ dự án demo offline từ LocalStorage lên Cloud khi khách đăng nhập/đăng ký
   */
  public static async syncLocalDemoToCloud(): Promise<{ syncedCount: number; errors: string[] }> {
    if (!this.isBrowser() || !isSupabaseConfigured()) {
      return { syncedCount: 0, errors: ["Chưa có kết nối Cloud"] };
    }

    const local = this.getLocalState();
    const demoProjects = local.projects.filter((p) => p.id.startsWith("proj-"));
    const errors: string[] = [];
    let syncedCount = 0;

    for (const proj of demoProjects) {
      const res = await this.saveProject(proj);
      if (res.success) {
        syncedCount++;
      } else if (res.error) {
        errors.push(`Dự án '${proj.projectName}': ${res.error}`);
      }
    }

    return { syncedCount, errors };
  }

  /**
   * Lấy danh sách thành viên trong xưởng
   */
  public static async getOrgMembers(orgId: string): Promise<Array<{ id: string; userId: string; role: string; email?: string }>> {
    if (!this.isBrowser() || !isSupabaseConfigured()) {
      return [];
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("org_members")
        .select("id, user_id, role")
        .eq("org_id", orgId);

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        role: d.role,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Mời thành viên mới vào xưởng với vai trò được chọn
   */
  public static async inviteOrgMember(
    orgId: string,
    userId: string,
    role: "owner" | "sales" | "viewer"
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isBrowser() || !isSupabaseConfigured()) {
      return { success: false, error: "Chưa kết nối Supabase Cloud" };
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("org_members").insert({
        org_id: orgId,
        user_id: userId,
        role,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Lỗi gửi lời mời thành viên" };
    }
  }

  /**
   * Xuất toàn bộ dữ liệu người dùng (Data Portability theo Nghị định 13)
   */
  public static async exportAllUserData(): Promise<{
    exportedAt: string;
    profile: WorkshopProfile;
    materials: MaterialItem[];
    projects: SavedProject[];
  }> {
    const profile = await this.getProfile();
    const materials = await this.getMaterials();
    const projects = await this.getProjects();

    return {
      exportedAt: new Date().toISOString(),
      profile,
      materials,
      projects,
    };
  }

  /**
   * Xóa sạch toàn bộ dữ liệu trên LocalStorage của máy client
   */
  public static clearAllLocalData(): void {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEYS.STATE);
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        localStorage.removeItem(STORAGE_KEYS.MATERIALS);
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.LEADS);
      } catch (e) {
        console.warn("Lỗi dọn dẹp LocalStorage:", e);
      }
    }
    memoryState = null;
  }
}
