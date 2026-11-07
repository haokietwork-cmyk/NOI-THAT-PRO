/**
 * MÔ HÌNH BÁO GIÁ VÁN GỖ CÔNG NGHIỆP NỘI ĐỊA (PANEL CNC MODEL)
 * Đóng gói logic hiện có thành CostingModel thuần túy, bảo toàn 100% kết quả cũ.
 */

import type { CostingModel, PricingContext } from "./pricing-context.ts";
import { calculateProject, type CalculationOptions } from "../engine.ts";
import type { CutlistPart, MaterialItem, ProjectCalculationResult } from "../../types/index.ts";

export interface PanelCncInput {
  parts: CutlistPart[];
  materials: MaterialItem[];
  options?: CalculationOptions;
}

export interface PanelCncOutput extends ProjectCalculationResult {
  modelId: "panel_cnc";
}

export const panelCncModel: CostingModel<PanelCncInput, PanelCncOutput> = {
  id: "panel_cnc",
  name: "Nội thất Ván Công Nghiệp (VND)",
  compute(input: PanelCncInput, ctx?: PricingContext): PanelCncOutput {
    const profitMargin = input.options?.profitMargin ?? (ctx ? 1 + ctx.constants.markup : 1.65);
    const result = calculateProject(input.parts, input.materials, {
      ...input.options,
      profitMargin,
    });

    return {
      ...result,
      modelId: "panel_cnc",
    };
  },
};
