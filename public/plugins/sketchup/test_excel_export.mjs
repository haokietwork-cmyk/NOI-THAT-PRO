import fs from 'fs';
import path from 'path';

// Kiểm thử sinh file Excel XML Spreadsheet (.xls)
const sampleParts = [
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Hoi_Trai', length: 810, width: 580, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '1_DAI', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Hoi_Phai', length: 810, width: 580, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '1_DAI', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Day_Tu', length: 766, width: 580, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '1_DAI', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Dot_Tu', length: 766, width: 560, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '2_DAI_1_RONG', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Van_Hau_6mm', length: 790, width: 750, thickness: 6, qty: 1, material: 'MDF_VAN_HAU_6', edges: 'KHONG_DAN', has_curve: false },
  { module_name: 'Mat_Ngan_Keo', part_name: 'Mat_Ngan_Keo', length: 794, width: 250, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '4_CANH', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Canh_Tu_Trai', length: 520, width: 396, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '4_CANH', has_curve: false },
  { module_name: 'Tu_Bep_Duoi_800', part_name: 'Canh_Tu_Phai', length: 520, width: 396, thickness: 17, qty: 1, material: 'MDF_CHONG_AM_17', edges: '4_CANH', has_curve: false },
  { module_name: 'Mat_Ban_Bar', part_name: 'Mat_Ban_Bar_Bo_Cong', length: 1500, width: 600, thickness: 25, qty: 1, material: 'MDF_CHONG_AM_25', edges: '1_DAI', has_curve: true }
];

const sampleSummary = {
  net_area_17: 2.42,
  net_area_6: 0.59,
  total_sheets_17: 1,
  total_sheets_6: 1,
  total_edge_meters: 12.7,
  total_edge_rolls: 1,
  estimated_cost: 2150000,
  client_quote: 2900000
};

function generateExcelXML(parts, summary) {
  const time_str = new Date().toLocaleString('vi-VN');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#1E293B"/></Style>
  <Style ss:ID="TitleStyle"><Font ss:FontName="Segoe UI" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/></Style>
  <Style ss:ID="SubTitleStyle"><Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/></Style>
  <Style ss:ID="HeaderStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F766E" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042F2E"/></Borders></Style>
  <Style ss:ID="SectionStyle"><Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#0F766E"/><Interior ss:Color="#F0FDFA" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#99F6E4"/></Borders></Style>
  <Style ss:ID="DataLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="DataCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="DataNumber"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="DataDecimal"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.000"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="DataMoney"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0 &quot;đ&quot;"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="TotalStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/><Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0284C7"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0284C7"/></Borders></Style>
 </Styles>
 <Worksheet ss:Name="Danh_Muc_Tam_Cat">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="35"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="65"/>
   <Column ss:Width="65"/>
   <Column ss:Width="50"/>
   <Column ss:Width="45"/>
   <Column ss:Width="75"/>
   <Column ss:Width="85"/>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Row ss:Height="30">
    <Cell ss:MergeAcross="12" ss:StyleID="TitleStyle"><Data ss:Type="String">BẢNG KÊ BÓC TÁCH VẬT TƯ &amp; QUY CÁCH CẮT VÁN NỘI THẤT</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="12" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Thời gian xuất: ${time_str} | Phần mềm: NoiThatPro Cutlist &amp; BOM V1.0</Data></Cell>
   </Row>
   <Row ss:Height="10"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">STT</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Hạng Mục</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tên Chi Tiết</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dài (mm)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Rộng (mm)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dày</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">SL</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">S (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tổng S (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Mã Vật Tư</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dán Chỉ PVC</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Mét Chỉ</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ghi Chú</Data></Cell>
   </Row>`;

  let totalArea = 0;
  let totalEdge = 0;

  parts.forEach((p, idx) => {
    const singleArea = (p.length * p.width) / 1000000;
    const totalPartArea = singleArea * p.qty;
    totalArea += totalPartArea;

    let edgeMm = 0;
    if (p.edges === '4_CANH') edgeMm = 2 * (p.length + p.width);
    else if (p.edges === '1_DAI') edgeMm = p.length;
    else if (p.edges === '2_DAI') edgeMm = 2 * p.length;
    else if (p.edges === '2_DAI_1_RONG') edgeMm = 2 * p.length + p.width;
    const partEdgeM = (edgeMm * p.qty * 1.08) / 1000;
    totalEdge += partEdgeM;

    const note = p.has_curve ? 'Bo Cong R' : '';

    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${p.module_name}</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${p.part_name}</Data></Cell>
    <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.length}</Data></Cell>
    <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.width}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${p.thickness}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${p.qty}</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${singleArea.toFixed(3)}</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${totalPartArea.toFixed(3)}</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${p.material}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">${p.edges}</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${partEdgeM.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">${note}</Data></Cell>
   </Row>`;
  });

  xml += `
   <Row ss:Height="22">
    <Cell ss:MergeAcross="7" ss:StyleID="TotalStyle"><Data ss:Type="String">TỔNG CỘNG:</Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${totalArea.toFixed(3)}</Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${totalEdge.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="String"></Data></Cell>
   </Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Tong_Hop_Dat_Hang">
  <Table ss:DefaultRowHeight="22">
   <Column ss:Width="40"/>
   <Column ss:Width="220"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="140"/>
   <Row ss:Height="30">
    <Cell ss:MergeAcross="5" ss:StyleID="TitleStyle"><Data ss:Type="String">TỔNG HỢP VẬT TƯ ĐẶT HÀNG ĐẠI LÝ &amp; DỰ TOÁN GIÁ VỐN</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="5" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Khổ ván chuẩn: 1220 x 2440 mm (2.977 m²) | Hệ số hao hụt ván: 15% | Hao hụt chỉ: 8%</Data></Cell>
   </Row>
   <Row ss:Height="10"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">STT</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Loại Vật Tư / Công Việc</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Khối Lượng Net</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Số Lượng Đặt Mua</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Đơn Vị Tính</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ghi Chú</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">1</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Ván MDF 17mm chống ẩm (Thùng, Cánh)</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${summary.net_area_17}</Data></Cell>
    <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${summary.total_sheets_17}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Tấm (1220x2440)</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 15% hao hụt</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">2</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Ván Hậu MDF 6mm (Đáy kéo, Hậu tủ)</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${summary.net_area_6}</Data></Cell>
    <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${summary.total_sheets_6}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Tấm (1220x2440)</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 15% hao hụt</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">3</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Chỉ dán cạnh PVC 21x1.0mm</Data></Cell>
    <Cell ss:StyleID="DataDecimal"><Data ss:Type="Number">${summary.total_edge_meters}</Data></Cell>
    <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${summary.total_edge_rolls}</Data></Cell>
    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Cuộn (100m)</Data></Cell>
    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 8% hao hụt chỉ</Data></Cell>
   </Row>
   <Row ss:Height="12"/>
   <Row>
    <Cell ss:MergeAcross="3" ss:StyleID="SectionStyle"><Data ss:Type="String">DỰ TOÁN GIÁ THÀNH XƯỞNG (THAM KHẢO)</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="SectionStyle"><Data ss:Type="String"></Data></Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="2" ss:StyleID="DataLeft"><Data ss:Type="String">Tổng Giá Vốn Sản Xuất (Vật tư + Nhân công)</Data></Cell>
    <Cell ss:StyleID="DataMoney"><Data ss:Type="Number">${summary.estimated_cost}</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="DataLeft"><Data ss:Type="String">Chi phí tại xưởng</Data></Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="2" ss:StyleID="DataLeft"><Data ss:Type="String">Báo Giá Đề Xuất Gửi Khách Hàng (Biên lợi nhuận 35%)</Data></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${summary.client_quote}</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="DataLeft"><Data ss:Type="String">Giá chốt hợp đồng</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
  return xml;
}

const outXlsPath = path.resolve('public/plugins/sketchup/sample_workshop_order.xls');
fs.writeFileSync(outXlsPath, generateExcelXML(sampleParts, sampleSummary), 'utf8');
console.log(`>>> Đã xuất file Excel kiểm nghiệm thành công tại: ${outXlsPath}`);
