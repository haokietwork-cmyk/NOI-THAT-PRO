/**
 * ĐỊNH NGHĨA DỮ LIỆU CHO HỆ THỐNG AI ƯỚC TÍNH (AI ESTIMATOR)
 * Tuân thủ mục 5A của brief-cong-cu-bao-gia.md và Bước 7 của runbook-trien-khai-brief.md
 */

export interface CandidateMaterial {
  rmCode: string;
  name: string;
  unit: string;
  priceUSD: number;
}

export interface EstimateRequest {
  description: string;
  dimensions?: {
    lengthMm?: number;
    widthMm?: number;
    thicknessMm?: number;
  };
  unit?: string;
  category?: string;
  candidateMaterials?: CandidateMaterial[];
  fx?: number; // Mặc định 25000
}

export interface ProposedLaborItem {
  process: string; // Mã công đoạn (RAW, MAC, VEN, ASS, SAND, CMF...)
  hours: number;
}

export interface PriceRangeUSD {
  low: number;
  mid: number;
  high: number;
}

export interface EstimateResponse {
  matchedRmCode: string | null;
  proposedItem: {
    name: string;
    unit: string;
  };
  qty: number;
  unitPriceUSD: PriceRangeUSD;
  waste: number;
  labor: ProposedLaborItem[];
  confidence: number; // 0.0 - 1.0
  assumptions: string[];
  isAiUnconfirmed: boolean; // Luôn là true cho đến khi người dùng bấm xác nhận
  isDemoMode: boolean;
  needsHumanReview: boolean;
}

export interface EstimatorProvider {
  readonly providerId: "gemini" | "mock";
  estimate(request: EstimateRequest): Promise<EstimateResponse>;
}
