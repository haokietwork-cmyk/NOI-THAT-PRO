import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { 
  PRODUCT_ARCHETYPES_CATALOG, 
  ARCHETYPE_CATEGORIES, 
  searchProductArchetypes, 
  normalizeVietnamese 
} from "./productArchetypesCatalog.ts";

describe("productArchetypesCatalog: Bộ danh mục sản phẩm đa ngành & Tìm kiếm thông minh", () => {
  it("Khởi tạo danh mục đầy đủ các ngành nghề (không chỉ có ván hộp)", () => {
    assert.ok(PRODUCT_ARCHETYPES_CATALOG.length >= 15, "Phải có ít nhất 15 mẫu sản phẩm đa ngành");

    const categories = new Set(PRODUCT_ARCHETYPES_CATALOG.map((p) => p.category));
    assert.ok(categories.has("cabinet"), "Phải có nhóm Tủ kệ & Ván");
    assert.ok(categories.has("solid_wood"), "Phải có nhóm Gỗ tự nhiên & Bàn ghế");
    assert.ok(categories.has("stone_metal"), "Phải có nhóm Mặt đá & Kim loại");
    assert.ok(categories.has("upholstery"), "Phải có nhóm Sofa, Bọc nệm & Da");
    assert.ok(categories.has("aluminum_glass"), "Phải có nhóm Nhôm kính & Cửa slim");
    assert.ok(categories.has("artistic_resin"), "Phải có nhóm Resin & Mỹ thuật");
    assert.ok(categories.has("custom"), "Phải có nhóm Tùy chỉnh tự do");
  });

  it("normalizeVietnamese: Chuẩn hóa tiếng Việt có dấu, không dấu và ký tự đặc biệt", () => {
    assert.equal(normalizeVietnamese("Bàn Ăn Gỗ Sồi"), "ban an go soi");
    assert.equal(normalizeVietnamese("Tủ áo ĐỒNG THAU 100%"), "tu ao dong thau 100");
    assert.equal(normalizeVietnamese("  Ghế   Sofa chữ L! "), "ghe sofa chu l");
  });

  it("searchProductArchetypes: Nhận diện từ lóng 'bàn phấn' -> Bàn trang điểm / Console", () => {
    const results = searchProductArchetypes("bàn phấn");
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "dressing_table");
  });

  it("searchProductArchetypes: Nhận diện 'chạn bát' / 'tủ chén' -> Tủ bếp dưới", () => {
    const results = searchProductArchetypes("chạn bát");
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "kitchen_base");

    const resultsChen = searchProductArchetypes("tủ chén");
    assert.ok(resultsChen.length > 0);
    assert.equal(resultsChen[0].id, "kitchen_base");
  });

  it("searchProductArchetypes: Nhận diện 'sofa chữ L' / 'sofa l' -> Bộ Sofa góc chữ L", () => {
    const results = searchProductArchetypes("sofa l");
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "sofa_sectional_l");
  });

  it("searchProductArchetypes: Nhận diện 'bàn trà mặt đá' / 'bàn sofa đá' -> Bàn trà mặt đá Onyx", () => {
    const results = searchProductArchetypes("bàn trà mặt đá");
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "onyx_brass_coffee_table");
    assert.equal(results[0].defaultFlags.hasStone, true);
  });

  it("searchProductArchetypes: Nhận diện 'cửa slim' / 'cửa trượt kính' -> Cửa lùa slim", () => {
    const results = searchProductArchetypes("cửa slim");
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "slim_sliding_door");
    assert.equal(results[0].defaultFlags.hasGlass, true);
  });

  it("searchProductArchetypes: Lọc theo danh mục (Category filter)", () => {
    const solidWoodOnly = searchProductArchetypes("", "solid_wood");
    assert.ok(solidWoodOnly.length > 0);
    solidWoodOnly.forEach((item) => {
      assert.equal(item.category, "solid_wood");
    });
  });
});
