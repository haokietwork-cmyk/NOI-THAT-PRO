import { NextResponse } from "next/server";
import { GeminiEstimatorProvider } from "@/core/ai/gemini-estimator";
import type { EstimateRequest } from "@/core/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, dimensions, unit, category, candidateMaterials } = body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Mô tả chi tiết là bắt buộc để AI ước tính." },
        { status: 400 }
      );
    }

    const requestPayload: EstimateRequest = {
      description: description.trim(),
      dimensions,
      unit,
      category,
      candidateMaterials,
    };

    const provider = new GeminiEstimatorProvider(process.env.GEMINI_API_KEY);
    const result = await provider.estimate(requestPayload);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API AI Estimate Error]:", error);
    return NextResponse.json(
      { error: "Không thể thực hiện ước tính AI lúc này. Vui lòng nhập thủ công." },
      { status: 500 }
    );
  }
}
