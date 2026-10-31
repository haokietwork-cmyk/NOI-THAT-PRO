"use client";

import { useState, useEffect } from "react";
import { CutlistPart, MaterialItem, SavedProject, WorkshopProfile } from "../types";
import { SEED_MATERIALS, SEED_PROFILE, SEED_PARTS, SEED_PROJECTS } from "../services/seedData";
import { StorageService } from "../services/storageService";

// Re-export canonical seed data để tương thích ngược 100%
export { SEED_MATERIALS, SEED_PROFILE, SEED_PARTS, SEED_PROJECTS };

// ============================================================================
// REACTIVE STORE TÍCH HỢP HYBRID STORAGE ADAPTER
// ============================================================================

interface AppState {
  profile: WorkshopProfile;
  materials: MaterialItem[];
  projects: SavedProject[];
}

let currentState: AppState = StorageService.getLocalState();
const listeners = new Set<() => void>();

function notify() {
  StorageService.setLocalState(currentState);
  listeners.forEach((listener) => listener());
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => currentState);

  useEffect(() => {
    // 1. Đồng bộ state client ngay khi mount
    setState(currentState);
    const onChange = () => setState({ ...currentState });
    listeners.add(onChange);

    // 2. Tự động tải từ Supabase nếu có phiên đăng nhập (bất đồng bộ trong background)
    let isMounted = true;
    Promise.all([
      StorageService.getProfile(),
      StorageService.getMaterials(),
      StorageService.getProjects(),
    ]).then(([profile, materials, projects]) => {
      if (isMounted) {
        currentState = { profile, materials, projects };
        notify();
      }
    });

    return () => {
      isMounted = false;
      listeners.delete(onChange);
    };
  }, []);

  // PROFILE ACTIONS
  const updateProfile = async (patch: Partial<WorkshopProfile>): Promise<{ success: boolean; error?: string }> => {
    const updated = { ...currentState.profile, ...patch };
    currentState = {
      ...currentState,
      profile: updated,
    };
    notify();
    return await StorageService.saveProfile(updated);
  };

  // MATERIALS ACTIONS
  const addMaterial = async (item: Omit<MaterialItem, "id">) => {
    const newItem: MaterialItem = {
      ...item,
      id: "mat-" + Date.now(),
    };
    currentState = {
      ...currentState,
      materials: [...currentState.materials, newItem],
    };
    notify();
    await StorageService.saveMaterials(currentState.materials);
  };

  const updateMaterial = async (id: string, patch: Partial<MaterialItem>) => {
    currentState = {
      ...currentState,
      materials: currentState.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    };
    notify();
    await StorageService.saveMaterials(currentState.materials);
  };

  const deleteMaterial = async (id: string) => {
    currentState = {
      ...currentState,
      materials: currentState.materials.filter((m) => m.id !== id),
    };
    notify();
    await StorageService.saveMaterials(currentState.materials);
  };

  // PROJECT ACTIONS
  const saveProject = async (project: SavedProject): Promise<{ success: boolean; error?: string }> => {
    const exists = currentState.projects.some((p) => p.id === project.id);
    const updatedProjects = exists
      ? currentState.projects.map((p) => (p.id === project.id ? project : p))
      : [project, ...currentState.projects];

    currentState = {
      ...currentState,
      projects: updatedProjects,
    };
    notify();
    return await StorageService.saveProject(project);
  };

  const deleteProject = async (id: string) => {
    currentState = {
      ...currentState,
      projects: currentState.projects.filter((p) => p.id !== id),
    };
    notify();
    await StorageService.deleteProject(id);
  };

  const createRevision = async (
    parentProjectId: string
  ): Promise<{ success: boolean; project?: SavedProject; error?: string }> => {
    const res = await StorageService.createRevision(parentProjectId);
    if (res.success && res.project) {
      currentState = {
        ...currentState,
        projects: [res.project, ...currentState.projects],
      };
      notify();
    }
    return res;
  };

  const getProject = (id: string): SavedProject | undefined => {
    return currentState.projects.find((p) => p.id === id);
  };

  const resetToDefaults = async () => {
    currentState = {
      profile: SEED_PROFILE,
      materials: SEED_MATERIALS,
      projects: SEED_PROJECTS,
    };
    notify();
    await StorageService.saveProfile(SEED_PROFILE);
    await StorageService.saveMaterials(SEED_MATERIALS);
  };

  return {
    profile: state.profile,
    materials: state.materials,
    projects: state.projects,
    updateProfile,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    saveProject,
    deleteProject,
    createRevision,
    getProject,
    resetToDefaults,
  };
}
