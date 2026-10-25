const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const srcDir = 'C:\\Users\\KIET_PC\\AppData\\Local\\Programs\\antigravity';
const artDir = 'C:\\Users\\KIET_PC\\.gemini\\antigravity\\brain\\a3b55a45-3983-44ee-8df5-74d9fae54ab6';
const desktop = 'C:\\Users\\KIET_PC\\Desktop';

const images = [
  'Giao_Dien_Cong_Cu_1_Cutlist_Danh_Sach.png',
  'Giao_Dien_Cong_Cu_1_Cutlist_Nesting_2D.png',
  'Giao_Dien_Cong_Cu_1_Cutlist_Ngu_Kim_BOM.png',
  'Giao_Dien_Cong_Cu_2_Profile_Kho_28_Mau.png',
  'Giao_Dien_Cong_Cu_2_Profile_Du_Toan_BOM.png'
];

images.forEach(img => {
  const src = path.join(srcDir, img);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(artDir, img));
    fs.copyFileSync(src, path.join(desktop, img));
    fs.copyFileSync(src, path.join(root, img));
    console.log('Successfully deployed fresh screenshot:', img);
  } else {
    console.warn('Screenshot missing in srcDir:', src);
  }
});

// Repackage .rbz: Compress to .zip first, then copy/rename to .rbz
function packagePlugin(name) {
  const pluginDir = path.join(root, 'public', 'plugins', 'sketchup', name);
  const loader = path.join(root, 'public', 'plugins', 'sketchup', `${name}.rb`);
  const zipTemp = path.join(root, 'public', 'plugins', 'sketchup', `${name}_temp.zip`);
  const rbzPath = path.join(root, 'public', 'plugins', 'sketchup', `${name}_v2.rbz`);
  const desktopRbz = path.join(desktop, `${name}_v2.rbz`);

  if (fs.existsSync(zipTemp)) fs.unlinkSync(zipTemp);
  if (fs.existsSync(rbzPath)) fs.unlinkSync(rbzPath);

  const cmd = `powershell -NoProfile -Command "Compress-Archive -Path '${pluginDir}', '${loader}' -DestinationPath '${zipTemp}' -Force"`;
  execSync(cmd, { stdio: 'inherit' });

  // Rename/copy temp zip to .rbz
  fs.copyFileSync(zipTemp, rbzPath);
  fs.copyFileSync(zipTemp, desktopRbz);
  fs.unlinkSync(zipTemp);

  console.log(`Successfully packaged and deployed ${name}_v2.rbz to public/ and Desktop!`);
}

packagePlugin('noithatpro_cutlist');
packagePlugin('noithatpro_profile');
