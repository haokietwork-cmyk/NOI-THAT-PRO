/**
 * BỘ GIẢI CÔNG THỨC ĐỊNH MỨC DẠNG BIỂU THỨC KHAI BÁO (DECLARATIVE DRIVER RESOLVER)
 * Tuân thủ Quy tắc 14 (GEMINI.md) & nguyen_ly_kien_truc_mo_cho_agent.md
 * 
 * ĐẶC ĐIỂM:
 * 1. Hoàn toàn thuần túy, an toàn 100% (KHÔNG dùng eval hay new Function).
 * 2. Phân loại và phân bổ Overhead dựa trên Behavior Tags (overheadTier).
 * 3. Hỗ trợ từ điển biến hình học dẫn xuất tự động.
 * 4. Cho phép mở rộng động nhóm chi phí và chèn Ad-hoc Cost Lines.
 */

import type {
  CostGroupConfig,
  DeclarativeLineRule,
  AdhocCostLine,
  BaseDimensionContext,
  ResolvedOpenCostLine,
  DynamicCostSummary,
  OverheadTier,
} from "./open-schema-types.ts";

export const DEFAULT_COST_GROUPS: CostGroupConfig[] = [
  { groupKey: "stone", label: "Mặt đá & Đá ốp (no OH)", overheadTier: "exempt_no_oh", sortOrder: 1, description: "Đá tự nhiên / nhân tạo mua đứt 0% OH" },
  { groupKey: "upholstery", label: "Bọc nệm & Da nỉ", overheadTier: "subcon_light", sortOrder: 2, description: "Gia công ngoài đệm da mút xốp" },
  { groupKey: "metal_out", label: "Khung kim loại gia công ngoài", overheadTier: "subcon_light", sortOrder: 3, description: "Chân sắt inox uốn gia công ngoài" },
  { groupKey: "subcontract", label: "Gia công ngoài & Thầu phụ", overheadTier: "subcon_light", sortOrder: 4, description: "Cánh Acrylic, CNC uốn cong" },
  { groupKey: "wood", label: "Ván gỗ công nghiệp", overheadTier: "workshop_full", sortOrder: 5, description: "Cốt ván MDF/HDF xưởng cắt CNC" },
  { groupKey: "metal", label: "Kim loại xưởng", overheadTier: "workshop_full", sortOrder: 6, description: "Khung sắt hộp xưởng tự cắt hàn" },
  { groupKey: "glass", label: "Cánh kính & Nhôm Slim", overheadTier: "subcon_light", sortOrder: 7, description: "Cánh kính khung nhôm thầu phụ" },
  { groupKey: "chemical", label: "Sơn & Hóa chất", overheadTier: "workshop_full", sortOrder: 8, description: "Sơn 2K, keo dán chuyên dụng" },
  { groupKey: "hardware", label: "Phụ kiện kim khí", overheadTier: "workshop_full", sortOrder: 9, description: "Bản lề, ray âm, tay nắm, LED" },
  { groupKey: "consumables", label: "Chỉ dán & Vật tư tiêu hao", overheadTier: "workshop_full", sortOrder: 10, description: "Chỉ nẹp PVC, keo PUR, ốc vít cam" },
  { groupKey: "packing", label: "Đóng gói & Vận chuyển", overheadTier: "workshop_full", sortOrder: 11, description: "Bọc màng PE, xe tải giao hàng" },
  { groupKey: "labor", label: "Nhân công trực tiếp", overheadTier: "workshop_full", sortOrder: 12, description: "Nhân công thợ mộc 4 công đoạn" },
];

/**
 * Xây dựng Từ điển Biến số Hình học Cơ sở từ kích thước mm
 */
export function buildDimensionContext(
  dimensions: { widthMm?: number; depthMm?: number; heightMm?: number; diameterMm?: number; unit?: string },
  params: Record<string, any> = {}
): BaseDimensionContext {
  const W = Math.max(0, (dimensions?.widthMm || 0) / 1000);
  const D = Math.max(0, (dimensions?.depthMm || 0) / 1000);
  const H = Math.max(0, (dimensions?.heightMm || 0) / 1000);
  const DIA = Math.max(0, (dimensions?.diameterMm || 0) / 1000);
  const QTY = Math.max(1, Number(params?.qty || 1));

  const FACE_AREA = W * H;
  const TOP_AREA = DIA > 0 ? (Math.PI * Math.pow(DIA / 2, 2)) : (W * D);
  const SIDE_AREA = D * H;
  const BOX_SURFACE = 2 * (W * H + W * D + D * H);
  const PERIMETER_TOP = DIA > 0 ? (Math.PI * DIA) : 2 * (W + D);
  const PERIMETER_FACE = 2 * (W + H);
  const VOLUME = W * D * H;

  return {
    W,
    D,
    H,
    DIA,
    QTY,
    FACE_AREA,
    TOP_AREA,
    SIDE_AREA,
    BOX_SURFACE,
    PERIMETER_TOP,
    PERIMETER_FACE,
    VOLUME,
    params: { ...params },
  };
}

/**
 * Đánh giá an toàn biểu thức toán học (KHÔNG dùng eval)
 * Hỗ trợ toán tử +, -, *, /, số thực, ngoặc tròn, biến hình học và params.<key>
 */
export function evaluateMathExpression(expr: string | number, ctx: BaseDimensionContext): number {
  if (typeof expr === "number") {
    return isNaN(expr) ? 0 : expr;
  }
  if (!expr || typeof expr !== "string") {
    return 0;
  }

  const raw = expr.trim();
  if (!raw) return 0;

  // Nếu là số thuần túy
  const directNum = Number(raw);
  if (!isNaN(directNum)) {
    return directNum;
  }

  // Tokenize & thay thế biến
  let tokenized = raw;

  // Thay thế các biến hình học chuẩn
  const vars: Record<string, number> = {
    BOX_SURFACE: ctx.BOX_SURFACE,
    PERIMETER_TOP: ctx.PERIMETER_TOP,
    PERIMETER_FACE: ctx.PERIMETER_FACE,
    FACE_AREA: ctx.FACE_AREA,
    TOP_AREA: ctx.TOP_AREA,
    SIDE_AREA: ctx.SIDE_AREA,
    VOLUME: ctx.VOLUME,
    W: ctx.W,
    D: ctx.D,
    H: ctx.H,
    DIA: ctx.DIA,
    QTY: ctx.QTY,
  };

  // Sắp xếp tên biến dài trước để không thay thế nhầm W trong BOX_SURFACE
  const sortedVarNames = Object.keys(vars).sort((a, b) => b.length - a.length);
  for (const v of sortedVarNames) {
    const regex = new RegExp(`\\b${v}\\b`, "g");
    tokenized = tokenized.replace(regex, vars[v].toString());
  }

  // Thay thế các biến params (VD: params.drawers hoặc params.drawerCount)
  tokenized = tokenized.replace(/params\.([a-zA-Z0-9_]+)/g, (_, key) => {
    const val = ctx.params[key];
    const num = Number(val);
    return isNaN(num) ? "0" : num.toString();
  });

  // Tính toán biểu thức toán học bằng thuật toán Shunting-yard an toàn
  try {
    return safeCalculateMath(tokenized);
  } catch {
    return 0;
  }
}

/**
 * Máy tính số học an toàn theo cú pháp Postfix (Shunting-yard algorithm)
 */
function safeCalculateMath(expr: string): number {
  const tokens: string[] = [];
  let current = "";

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === " ") continue;

    if ("+-*/()".includes(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(ch);
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);

  // Chuyển sang Reverse Polish Notation (RPN)
  const outputQueue: string[] = [];
  const opStack: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const num = Number(token);

    if (!isNaN(num)) {
      outputQueue.push(token);
    } else if (token in precedence) {
      // Xử lý dấu âm đơn nguyên (unary minus)
      if (token === "-" && (i === 0 || tokens[i - 1] === "(" || tokens[i - 1] in precedence)) {
        outputQueue.push("0");
      }
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1] in precedence &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token === "(") {
      opStack.push(token);
    } else if (token === ")") {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
        outputQueue.push(opStack.pop()!);
      }
      opStack.pop(); // Bỏ dấu '('
    }
  }

  while (opStack.length > 0) {
    outputQueue.push(opStack.pop()!);
  }

  // Tính giá trị RPN
  const stack: number[] = [];
  for (const token of outputQueue) {
    const num = Number(token);
    if (!isNaN(num)) {
      stack.push(num);
    } else {
      const b = stack.pop() ?? 0;
      const a = stack.pop() ?? 0;
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(b !== 0 ? a / b : 0); break;
      }
    }
  }

  return stack.length > 0 ? stack[0] : 0;
}

/**
 * Đánh giá điều kiện whenExpression an toàn (VD: "params.hasStone == true", "params.drawers > 0")
 */
export function evaluateCondition(cond: string | undefined, ctx: BaseDimensionContext): boolean {
  if (!cond || !cond.trim()) return true;

  const raw = cond.trim();

  // Hỗ trợ nối điều kiện && và ||
  if (raw.includes("&&")) {
    return raw.split("&&").every((sub) => evaluateCondition(sub.trim(), ctx));
  }
  if (raw.includes("||")) {
    return raw.split("||").some((sub) => evaluateCondition(sub.trim(), ctx));
  }

  // Tìm toán tử so sánh
  const ops = ["==", "!=", ">=", "<=", ">", "<"];
  let matchedOp = "";
  for (const op of ops) {
    if (raw.includes(op)) {
      matchedOp = op;
      break;
    }
  }

  if (!matchedOp) {
    // Nếu chỉ là một biến boolean đơn lẻ: vd "params.hasStone"
    const val = getContextValue(raw, ctx);
    return Boolean(val);
  }

  const parts = raw.split(matchedOp);
  const leftVal = getContextValue(parts[0].trim(), ctx);
  const rightVal = parseLiteralValue(parts[1].trim());

  switch (matchedOp) {
    case "==": return leftVal == rightVal;
    case "!=": return leftVal != rightVal;
    case ">=": return Number(leftVal) >= Number(rightVal);
    case "<=": return Number(leftVal) <= Number(rightVal);
    case ">": return Number(leftVal) > Number(rightVal);
    case "<": return Number(leftVal) < Number(rightVal);
    default: return true;
  }
}

function getContextValue(token: string, ctx: BaseDimensionContext): any {
  if (token.startsWith("params.")) {
    const key = token.slice(7);
    return ctx.params[key];
  }
  if (token in ctx) {
    return (ctx as any)[token];
  }
  return parseLiteralValue(token);
}

function parseLiteralValue(str: string): any {
  if (str === "true") return true;
  if (str === "false") return false;
  if (str === "null" || str === "undefined") return null;
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    return str.slice(1, -1);
  }
  const num = Number(str);
  if (!isNaN(num)) return num;
  return str;
}

/**
 * ĐỘNG CƠ GIẢI TỔNG QUÁT: Giải toàn bộ DeclarativeLineRule[] & AdhocCostLine[]
 */
export function resolveDeclarativeRules(
  dimensions: { widthMm?: number; depthMm?: number; heightMm?: number; diameterMm?: number },
  params: Record<string, any> = {},
  rules: DeclarativeLineRule[] = [],
  adhocLines: AdhocCostLine[] = [],
  costGroups: CostGroupConfig[] = DEFAULT_COST_GROUPS,
  options: {
    workshopOhRate?: number;
    subcontractOhRate?: number;
    profitRate?: number;
    materialsLibrary?: Array<{ id: string; category?: string; unitPrice?: number; wasteFactor?: number }>;
  } = {}
): {
  lines: ResolvedOpenCostLine[];
  summary: DynamicCostSummary;
} {
  const ctx = buildDimensionContext(dimensions, params);
  const workshopOhRate = options.workshopOhRate ?? 0.25;
  const subcontractOhRate = options.subcontractOhRate ?? 0.1;
  const profitRate = options.profitRate ?? 0.2;

  // Bản đồ nhóm chi phí để tra cứu overheadTier
  const groupMap = new Map<string, CostGroupConfig>();
  for (const g of costGroups) {
    groupMap.set(g.groupKey, g);
  }

  const resolvedLines: ResolvedOpenCostLine[] = [];

  // 1. Giải các dòng Declarative Rules
  for (const rule of rules) {
    // Kiểm tra điều kiện kích hoạt
    if (!evaluateCondition(rule.whenExpression, ctx)) {
      continue;
    }

    const rawQty = evaluateMathExpression(rule.quantityExpression, ctx);
    if (rawQty <= 0) continue;

    // Hao hụt
    const wasteFactor = 1 + Math.max(0, rule.wasteRate || 0);
    let effectiveQty = rawQty * wasteFactor;

    // Làm tròn theo quy cách
    if (rule.roundingMode === "ceil_standard_unit" && rule.standardUnitSize && rule.standardUnitSize > 0) {
      effectiveQty = Math.ceil(effectiveQty / rule.standardUnitSize);
    } else if (rule.roundingMode === "ceil_whole_number") {
      effectiveQty = Math.ceil(effectiveQty);
    }

    // Đơn giá
    const unitPrice = rule.defaultUnitPrice ?? 0;
    const totalCost = Math.round(effectiveQty * unitPrice);

    // Xác định Overhead qua Behavior Tier
    const group = groupMap.get(rule.costGroupKey);
    const tier: OverheadTier = group?.overheadTier || "workshop_full";

    let ohRate = 0;
    if (tier === "workshop_full") {
      ohRate = workshopOhRate;
    } else if (tier === "subcon_light") {
      ohRate = subcontractOhRate;
    } else {
      ohRate = 0; // exempt_no_oh -> 0%
    }

    const ohAmount = Math.round(totalCost * ohRate);

    // Điền mô tả từ template (nếu có biến)
    let desc = rule.descriptionTemplate;
    desc = desc.replace(/\{\{params\.([a-zA-Z0-9_]+)\}\}/g, (_, k) => ctx.params[k] ?? "");

    resolvedLines.push({
      id: `rule_${rule.ruleId}_${resolvedLines.length}`,
      ruleId: rule.ruleId,
      blockName: rule.blockName,
      costGroupKey: rule.costGroupKey,
      overheadTier: tier,
      description: desc,
      unit: rule.unit,
      rawQuantity: Number(rawQty.toFixed(3)),
      effectiveQuantity: Number(effectiveQty.toFixed(3)),
      unitPrice,
      totalCost,
      ohRate,
      ohAmount,
      totalWithOh: totalCost + ohAmount,
      isAdhoc: false,
    });
  }

  // 2. Giải các dòng AdhocCostLine do người dùng thêm tự do
  for (const adhoc of adhocLines) {
    let rawQty = 0;
    if (typeof adhoc.quantityOrExpression === "number") {
      rawQty = adhoc.quantityOrExpression;
    } else {
      rawQty = evaluateMathExpression(adhoc.quantityOrExpression, ctx);
    }

    if (rawQty <= 0) continue;

    const wasteFactor = 1 + Math.max(0, adhoc.wasteRate || 0);
    const effectiveQty = rawQty * wasteFactor;
    const unitPrice = adhoc.unitPrice || 0;
    const totalCost = Math.round(effectiveQty * unitPrice);

    // Xác định Overhead Tier (ưu tiên override, sau đó tra theo groupMap)
    let tier: OverheadTier = adhoc.overheadTierOverride || groupMap.get(adhoc.costGroupKey)?.overheadTier || "workshop_full";

    let ohRate = 0;
    if (tier === "workshop_full") {
      ohRate = workshopOhRate;
    } else if (tier === "subcon_light") {
      ohRate = subcontractOhRate;
    } else {
      ohRate = 0; // exempt_no_oh
    }

    const ohAmount = Math.round(totalCost * ohRate);

    resolvedLines.push({
      id: adhoc.lineId || `adhoc_${resolvedLines.length}`,
      blockName: adhoc.blockName,
      costGroupKey: adhoc.costGroupKey,
      overheadTier: tier,
      description: adhoc.description,
      unit: adhoc.unit,
      rawQuantity: Number(rawQty.toFixed(3)),
      effectiveQuantity: Number(effectiveQty.toFixed(3)),
      unitPrice,
      totalCost,
      ohRate,
      ohAmount,
      totalWithOh: totalCost + ohAmount,
      isAdhoc: true,
    });
  }

  // 3. Tổng hợp Bảng Dynamic Cost Summary
  const groupTotals: Record<string, number> = {};
  let totalDirectLM = 0;
  let ohWorkshopAmount = 0;
  let ohSubcontractAmount = 0;

  for (const line of resolvedLines) {
    groupTotals[line.costGroupKey] = (groupTotals[line.costGroupKey] || 0) + line.totalCost;
    totalDirectLM += line.totalCost;

    if (line.overheadTier === "workshop_full") {
      ohWorkshopAmount += line.ohAmount;
    } else if (line.overheadTier === "subcon_light") {
      ohSubcontractAmount += line.ohAmount;
    }
  }

  const totalOH = ohWorkshopAmount + ohSubcontractAmount;
  const cogs = totalDirectLM + totalOH;
  const profitAmount = Math.round(cogs * profitRate);
  const salesPrice = cogs + profitAmount;

  // MOQ Prices: Bậc thang 1, 5, 10, 20 cái
  const moqTiers = [1, 5, 10, 20];
  const moqPrices: Record<number, number> = {};
  for (const qty of moqTiers) {
    const discountFactor = qty === 1 ? 1.0 : qty === 5 ? 0.94 : qty === 10 ? 0.88 : 0.82;
    moqPrices[qty] = Math.round(salesPrice * discountFactor);
  }

  return {
    lines: resolvedLines,
    summary: {
      groupTotals,
      totalDirectLM,
      ohWorkshopAmount,
      ohSubcontractAmount,
      totalOH,
      cogs,
      profitAmount,
      salesPrice,
      moqPrices,
    },
  };
}
