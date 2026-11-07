/**
 * GEMINI ESTIMATOR PROVIDER - BỘ ƯỚC TÍNH AI CHO DÒNG BÁO GIÁ THIẾU DỮ LIỆU
 * Tuân thủ mục 5A brief-cong-cu-bao-gia.md:
 * - Hỗ trợ Demo mode (khi chưa có key thì trả về ước tính tham khảo an toàn)
 * - Tích hợp Google Gemini REST API khi có GEMINI_API_KEY
 * - Kiểm tra chống prompt injection
 * - Gắn cờ isAiUnconfirmed: true để người dùng kiểm duyệt
 */

import type {
  CandidateMaterial,
  EstimateRequest,
  EstimateResponse,
  EstimatorProvider,
  ProposedLaborItem,
} from "./types.ts";
import { SAMPLE_MATERIALS_CATALOG } from "../data/exportFurnitureCatalog.ts";

export class GeminiEstimatorProvider implements EstimatorProvider {
  readonly providerId = "gemini" as const;
  private apiKey: string | null;

  constructor(apiKey?: string | null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
  }

  /**
   * Khử độc input: coi mô tả của người dùng là dữ liệu thuần, không cho phép prompt injection
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/[\r\n\t]+/g, " ")
      .slice(0, 300) // Giới hạn độ dài tối đa 300 ký tự
      .trim();
  }

  /**
   * Heuristic tìm kiếm vật tư tương đồng trong kho danh mục tham khảo
   */
  private findBestMatchInCatalog(description: string): {
    matchedRmCode: string | null;
    matchedName: string;
    unit: string;
    priceUSD: number;
    waste: number;
  } {
    const q = description.toLowerCase();

    // Chuẩn hóa khoảng trắng trong chuỗi tìm kiếm
    const normalizedQ = q.replace(/\s+/g, " ");

    // 1. Gỗ sồi / Oak
    if (normalizedQ.includes("sồi") || normalizedQ.includes("oak")) {
      const match = SAMPLE_MATERIALS_CATALOG.find(
        (m) =>
          m.rmCode &&
          (m.subCategory === "Oak Wood" || m.name.toLowerCase().includes("oak"))
      );
      if (match)
        return {
          matchedRmCode: match.rmCode,
          matchedName: match.name,
          unit: match.unit,
          priceUSD: match.priceUSD,
          waste: match.waste || 0.45,
        };
    }

    // 2. Gỗ Walnut / Óc chó
    if (normalizedQ.includes("walnut") || normalizedQ.includes("óc chó")) {
      const match = SAMPLE_MATERIALS_CATALOG.find(
        (m) =>
          m.rmCode &&
          (m.subCategory === "Walnut Wood" || m.name.toLowerCase().includes("walnut"))
      );
      if (match)
        return {
          matchedRmCode: match.rmCode,
          matchedName: match.name,
          unit: match.unit,
          priceUSD: match.priceUSD,
          waste: match.waste || 0.5,
        };
    }

    // 3. Gỗ Beech / Dẻ gai
    if (normalizedQ.includes("beech") || normalizedQ.includes("dẻ gai")) {
      const match = SAMPLE_MATERIALS_CATALOG.find(
        (m) =>
          m.rmCode &&
          (m.subCategory === "Beech Wood" || m.name.toLowerCase().includes("beech"))
      );
      if (match)
        return {
          matchedRmCode: match.rmCode,
          matchedName: match.name,
          unit: match.unit,
          priceUSD: match.priceUSD,
          waste: match.waste || 0.45,
        };
    }

    // 4. Ván MDF
    if (q.includes("mdf")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("mdf 18") || m.name.toLowerCase().includes("mdf chống ẩm"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.2 };
    }

    // 5. Ván Plywood
    if (q.includes("plywood") || q.includes("ván ép")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("plywood 18 b/c") || m.name.toLowerCase().includes("plywood"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.2 };
    }

    // 6. Veneer
    if (q.includes("veneer") || q.includes("vân gỗ")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("veneer ash") || m.name.toLowerCase().includes("veneer sồi"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.3 };
    }

    // 7. Kim loại / Đồng / Khung sắt
    if (q.includes("đồng") || q.includes("brass") || q.includes("sắt") || q.includes("steel") || q.includes("kim loại")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("brass frame") || m.name.toLowerCase().includes("steel frame"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.1 };
    }

    // 8. Đá Marble / Quartz
    if (q.includes("đá") || q.includes("marble") || q.includes("quartz") || q.includes("onyx")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("quartzite") || m.name.toLowerCase().includes("carrara") || m.name.toLowerCase().includes("onyx"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.0 };
    }

    // 9. Nệm / Foam / Da / Vải
    if (q.includes("nệm") || q.includes("foam") || q.includes("da") || q.includes("leather") || q.includes("vải")) {
      const match = SAMPLE_MATERIALS_CATALOG.find((m) => m.name.toLowerCase().includes("pu foam") || m.name.toLowerCase().includes("leather"));
      if (match) return { matchedRmCode: match.rmCode, matchedName: match.name, unit: match.unit, priceUSD: match.priceUSD, waste: match.waste || 0.15 };
    }

    // Mặc định an toàn
    return {
      matchedRmCode: null,
      matchedName: description,
      unit: "pcs",
      priceUSD: 10.0,
      waste: 0.15,
    };
  }

  /**
   * Tạo kết quả ước tính theo chế độ Demo / Fallback
   */
  private generateDemoEstimate(request: EstimateRequest): EstimateResponse {
    const cleanDesc = this.sanitizeInput(request.description);
    const catalogMatch = this.findBestMatchInCatalog(cleanDesc);

    // Ước lượng các công đoạn nhân công cơ bản theo nhóm
    const labor: ProposedLaborItem[] = [];
    if (catalogMatch.unit === "m3" || cleanDesc.toLowerCase().includes("gỗ")) {
      labor.push({ process: "RAW", hours: 1.5 });
      labor.push({ process: "MAC", hours: 3.0 });
      labor.push({ process: "ASS", hours: 2.5 });
      labor.push({ process: "SandSpay", hours: 1.5 });
    } else if (catalogMatch.unit === "m2") {
      labor.push({ process: "CNC-MDF", hours: 1.0 });
      labor.push({ process: "VEN", hours: 2.0 });
      labor.push({ process: "ASS", hours: 1.5 });
    } else {
      labor.push({ process: "FIT", hours: 0.5 });
      labor.push({ process: "Packing", hours: 0.5 });
    }

    const basePrice = catalogMatch.priceUSD;
    return {
      matchedRmCode: catalogMatch.matchedRmCode,
      proposedItem: {
        name: catalogMatch.matchedName,
        unit: request.unit || catalogMatch.unit,
      },
      qty: 1,
      unitPriceUSD: {
        low: Math.round(basePrice * 0.85 * 100) / 100,
        mid: Math.round(basePrice * 100) / 100,
        high: Math.round(basePrice * 1.25 * 100) / 100,
      },
      waste: catalogMatch.waste,
      labor,
      confidence: catalogMatch.matchedRmCode ? 0.85 : 0.65,
      assumptions: [
        `Đối chiếu với dữ liệu danh mục xưởng (Sheet1) theo từ khóa: "${cleanDesc}"`,
        `Đơn giá giờ nhân công tính theo chuẩn 4.2 USD/h (105.000 VND/h, Dòng 723 Material)`,
        "Chế độ Demo (chưa kết nối API Key trực tiếp). Vui lòng xác nhận trước khi chốt giá.",
      ],
      isAiUnconfirmed: true,
      isDemoMode: true,
      needsHumanReview: !catalogMatch.matchedRmCode,
    };
  }

  /**
   * Gọi AI ước tính (Gemini REST API hoặc Demo Fallback)
   */
  async estimate(request: EstimateRequest): Promise<EstimateResponse> {
    const cleanDesc = this.sanitizeInput(request.description);

    // Nếu không có API Key, sử dụng Demo Mode
    if (!this.apiKey) {
      return this.generateDemoEstimate(request);
    }

    try {
      const candidatesPrompt = (request.candidateMaterials || [])
        .slice(0, 8)
        .map((c) => `- Mã: ${c.rmCode}, Tên: ${c.name}, Đơn vị: ${c.unit}, Giá USD: ${c.priceUSD}`)
        .join("\n");

      const promptText = `Bạn là chuyên gia bóc tách dự toán nội thất cao cấp.
Nhiệm vụ: Phân tích mô tả chi tiết sau và đề xuất mã vật tư phù hợp từ danh mục, đơn vị, đơn giá USD và số giờ công công đoạn.
Mô tả chi tiết: "${cleanDesc}"
Kích thước mm: ${JSON.stringify(request.dimensions || {})}
Ứng viên danh mục:
${candidatesPrompt || "Không có danh mục ứng viên, hãy đề xuất từ kiến thức chuẩn ngành."}

YÊU CẦU: Phản hồi BẮT BUỘC dạng JSON thuần túy (không markdown, không giải thích ngoài JSON) theo đúng cấu trúc:
{
  "matchedRmCode": "mã RM khớp hoặc null",
  "proposedName": "tên chi tiết chuẩn",
  "unit": "m2|m3|pcs|m|set|kg",
  "unitPriceUSD": { "low": số, "mid": số, "high": số },
  "waste": số_từ_0_đến_1,
  "labor": [ { "process": "RAW|MAC|CNC-MDF|VEN|ASS|SandSpay|FIT|Packing", "hours": số } ],
  "confidence": số_từ_0_đến_1,
  "assumptions": ["giả định 1", "giả định 2"]
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[GeminiEstimator] API call failed with status ${response.status}, falling back to Demo Mode.`);
        return this.generateDemoEstimate(request);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.generateDemoEstimate(request);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        matchedRmCode: parsed.matchedRmCode || null,
        proposedItem: {
          name: parsed.proposedName || cleanDesc,
          unit: parsed.unit || "pcs",
        },
        qty: 1,
        unitPriceUSD: {
          low: Number(parsed.unitPriceUSD?.low || parsed.unitPriceUSD?.mid || 10),
          mid: Number(parsed.unitPriceUSD?.mid || 10),
          high: Number(parsed.unitPriceUSD?.high || parsed.unitPriceUSD?.mid || 10),
        },
        waste: Number(parsed.waste || 0.15),
        labor: Array.isArray(parsed.labor) ? parsed.labor : [],
        confidence: Number(parsed.confidence || 0.8),
        assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
        isAiUnconfirmed: true,
        isDemoMode: false,
        needsHumanReview: false,
      };
    } catch (err) {
      console.warn("[GeminiEstimator] Error during API call:", err);
      return this.generateDemoEstimate(request);
    }
  }
}
