const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const net = require('net');
const crypto = require('crypto');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Ayarlar dosyası yolu
const settingsPath = path.join(__dirname, 'settings.json');

// Varsayılan ayarlar
const defaultSettings = {
  projectsDirectory: null  // İlk açılışta null, kullanıcı seçecek
};

// Ayarları yükle
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.log('Ayarlar yüklenirken hata:', e.message);
  }
  return defaultSettings;
}

// Ayarları kaydet
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (e) {
    console.log('Ayarlar kaydedilirken hata:', e.message);
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Menü çubuğunu kaldır
    autoHideMenuBar: true,
    menuBarVisible: false
  });
  
  // Menü çubuğunu tamamen kaldır
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
  
  // Uygulama açılırken zombie IIS Express işlemlerini temizle
  cleanupZombieProcesses();
}

// Zombie IIS Express işlemlerini temizle
async function cleanupZombieProcesses() {
  try {
    const { stdout: tasklistOut } = await execAsync('tasklist /FI "IMAGENAME eq iisexpress.exe" /FO CSV /NH');
    const iisLines = tasklistOut.split('\n').filter(line => line.includes('iisexpress.exe'));
    
    if (iisLines.length > 0) {
      console.log(`${iisLines.length} zombie IIS Express işlemi bulundu, temizleniyor...`);
      
      for (const line of iisLines) {
        const csvParts = line.split(',');
        if (csvParts.length >= 2) {
          const processPid = csvParts[1].replace(/"/g, '').trim();
          
          // Bu PID'nin port dinleyip dinlemediğini kontrol et
          try {
            const { stdout: netstatOut } = await execAsync(`netstat -ano | findstr ${processPid}`);
            if (!netstatOut.trim()) {
              // Port dinlemiyor, zombie process
              console.log(`Zombie IIS Express temizleniyor: PID ${processPid}`);
              await execAsync(`taskkill /PID ${processPid} /F`);
            }
          } catch (e) {
            // Netstat hatası, muhtemelen zombie
            try {
              await execAsync(`taskkill /PID ${processPid} /F`);
            } catch (killError) {
              // İşlem zaten ölmüş
            }
          }
        }
      }
    }
  } catch (e) {
    // Temizleme hatası, devam et
  }
}

app.whenReady().then(createWindow);

// Port kontrolü - hızlı ve güvenilir
function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.once('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// IIS Express işlemlerini bul - basitleştirilmiş versiyon
async function findIISProcessByPort(port) {
  try {
    if (process.platform !== 'win32') return null;
    
    // Doğrudan o port için netstat kontrolü yap
    try {
      const { stdout: netstatOut } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = netstatOut.split('\n').filter(line => line.includes('LISTENING'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && !isNaN(pid) && parseInt(pid) > 4) { // Sistem PID'lerini atla
          // Bu PID'nin IIS Express olup olmadığını kontrol et
          try {
            const { stdout: taskOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH /FO CSV`);
            if (taskOutput.toLowerCase().includes('iisexpress.exe')) {
              console.log(`Port ${port} için IIS Express PID bulundu: ${pid}`);
              return parseInt(pid);
            }
          } catch (e) {
            continue;
          }
        }
      }
    } catch (netstatError) {
      console.log(`Port ${port} netstat kontrolü başarısız:`, netstatError.message);
    }
    
    console.log(`Port ${port} için IIS Express işlemi bulunamadı`);
    return null;
  } catch (e) {
    console.log(`Port ${port} kontrolünde hata:`, e.message);
    return null;
  }
}

// Port numarası oluşturma - dizin yoluna göre
function generatePortForProject(projectPath, index) {
  // Proje yolunun hash'ini hesapla
  const hash = crypto.createHash('md5').update(projectPath).digest('hex');
  
  // Hash'in ilk 4 karakterini sayıya çevir ve port aralığına sığdır
  const hashNum = parseInt(hash.substring(0, 4), 16);
  const basePort = 8000 + (hashNum % 1000); // 8000-8999 arası
  
  return basePort + index;
}

// Proje listesi - dinamik klasör ile gerçek durum kontrolü
ipcMain.handle('get-projects', async () => {
  const settings = loadSettings();
  const rootDir = settings.projectsDirectory;
  
  try {
    // Dizin seçilmemiş mi kontrol et
    if (!rootDir) {
      return { error: 'Henüz proje klasörü seçilmedi. Lütfen "Klasör Seç" butonuna tıklayarak bir klasör seçin.' };
    }
    
    // Klasör mevcut mu kontrol et
    if (!fs.existsSync(rootDir)) {
      return { error: `Proje klasörü bulunamadı: ${rootDir}` };
    }
    
    const folders = fs.readdirSync(rootDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    const projects = [];
    
    // Her proje için ayrı ayrı kontrol et
    for (let i = 0; i < folders.length; i++) {
      const dirent = folders[i];
      const fullPath = path.join(rootDir, dirent.name);
      const asp = fs.existsSync(path.join(fullPath, 'default.asp'));
      
      // Dizin yoluna göre benzersiz port oluştur
      const port = generatePortForProject(rootDir, i);
      
      // Port kontrolü yap
      const running = await checkPort(port);
      
      projects.push({
        name: dirent.name,
        path: fullPath,
        asp,
        port,
        running
      });
    }
    
    return { projects, projectsDirectory: rootDir };
  } catch (e) {
    return { error: `Proje listesi alınırken hata: ${e.message}` };
  }
});

// Klasör seçme dialogu
ipcMain.handle('select-projects-directory', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Proje Klasörünü Seçin',
      defaultPath: loadSettings().projectsDirectory,
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      const settings = loadSettings();
      settings.projectsDirectory = selectedPath;
      
      if (saveSettings(settings)) {
        return { success: true, path: selectedPath };
      } else {
        return { success: false, error: 'Ayarlar kaydedilemedi' };
      }
    }
    
    return { success: false, error: 'Klasör seçilmedi' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Mevcut ayarları al
ipcMain.handle('get-settings', async () => {
  return loadSettings();
});

// Ayarları güncelle
ipcMain.handle('update-settings', async (event, newSettings) => {
  try {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    if (saveSettings(updatedSettings)) {
      return { success: true, settings: updatedSettings };
    } else {
      return { success: false, error: 'Ayarlar kaydedilemedi' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});
ipcMain.handle('start-project', async (event, projectPath, port) => {
  try {
    console.log(`Proje başlatılıyor: ${projectPath} port: ${port}`);
    
    // Önce port boş mu kontrol et
    const portIsRunning = await checkPort(port);
    if (portIsRunning) {
      console.log(`Port ${port} zaten kullanımda`);
      return { success: false, error: `Port ${port} zaten kullanımda` };
    }
    
    const iisExe = 'C:/Program Files/IIS Express/iisexpress.exe';
    const args = [`/path:${projectPath}`, `/port:${port}`];
    
    // IIS Express dosyası var mı kontrol et
    if (!fs.existsSync(iisExe)) {
      return { success: false, error: 'IIS Express bulunamadı. Lütfen IIS Express\'i yükleyin.' };
    }
    
    const child = spawn(iisExe, args, {
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    
    console.log(`IIS Express başlatıldı, PID: ${child.pid}, port açılması bekleniyor...`);
    
    // Port açılana kadar bekle (max 10 saniye)
    const maxAttempts = 20;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
      
      const isPortOpen = await checkPort(port);
      if (isPortOpen) {
        console.log(`Port ${port} başarıyla açıldı`);
        return { success: true, pid: child.pid };
      }
    }
    
    // Port açılmadı, işlemi öldür
    console.log(`Port ${port} ${maxAttempts * 500}ms içinde açılmadı, işlem sonlandırılıyor`);
    try {
      process.kill(child.pid, 'SIGKILL');
    } catch (e) {
      // İşlem zaten ölmüş olabilir
    }
    
    return { success: false, error: 'IIS Express başlatıldı ama port açılmadı. Proje dizini veya port sorunu olabilir.' };
    
  } catch (error) {
    console.log(`Proje başlatma hatası:`, error.message);
    return { success: false, error: error.message };
  }
});

// Proje durdur - basit ama etkili yaklaşım
ipcMain.handle('stop-project', async (event, port) => {
  try {
    console.log(`Port ${port} durdurma işlemi başlatılıyor...`);
    
    // Önce port çalışıyor mu kontrol et
    const portIsRunning = await checkPort(port);
    console.log(`Port ${port} durumu: ${portIsRunning ? 'Çalışıyor' : 'Çalışmıyor'}`);
    
    if (!portIsRunning) {
      console.log(`Port ${port} zaten çalışmıyor`);
      return { success: true };
    }
    
    // Port çalışıyorsa, o portu kullanan işlemi bul
    const pid = await findIISProcessByPort(port);
    
    if (pid) {
      console.log(`Port ${port} için PID ${pid} durdurulacak`);
      await execAsync(`taskkill /PID ${pid} /T /F`);
      console.log(`PID ${pid} başarıyla durduruldu`);
      return { success: true };
    } else {
      // Port çalışıyor ama IIS Express bulunamadı
      // Bu durumda tüm IIS Express işlemlerini temizle
      console.log(`Port ${port} çalışıyor ama IIS Express bulunamadı, tüm IIS Express işlemleri temizleniyor`);
      try {
        await execAsync('taskkill /IM iisexpress.exe /F');
        console.log('Tüm IIS Express işlemleri temizlendi');
        return { success: true };
      } catch (cleanupError) {
        console.log('IIS Express temizleme başarısız:', cleanupError.message);
        return { success: false, error: 'Port çalışıyor ama durdurulmuyor' };
      }
    }
  } catch (error) {
    console.log(`Port ${port} durdurma hatası:`, error.message);
    return { success: false, error: `Durdurma hatası: ${error.message}` };
  }
});

// Tüm IIS Express işlemlerini durdur
ipcMain.handle('stop-all-projects', async () => {
  try {
    if (process.platform === 'win32') {
      await execAsync('taskkill /IM iisexpress.exe /F');
    } else {
      await execAsync('pkill iisexpress');
    }
    return { success: true };
  } catch (error) {
    // Hiç IIS Express çalışmıyorsa da başarılı say
    return { success: true };
  }
});

// Tarayıcıda aç
ipcMain.handle('open-browser', async (event, port) => {
  const url = `http://localhost:${port}`;
  try {
    if (process.platform === 'win32') {
      await execAsync(`start ${url}`);
    } else if (process.platform === 'darwin') {
      await execAsync(`open ${url}`);
    } else {
      await execAsync(`xdg-open ${url}`);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Dizini aç
ipcMain.handle('open-directory', async (event, dirPath) => {
  try {
    if (process.platform === 'win32') {
      // Windows için çift tırnak ve escape karakterleri düzelt
      const normalizedPath = path.normalize(dirPath).replace(/\//g, '\\');
      await execAsync(`explorer "${normalizedPath}"`);
    } else if (process.platform === 'darwin') {
      await execAsync(`open "${dirPath}"`);
    } else {
      await execAsync(`xdg-open "${dirPath}"`);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
