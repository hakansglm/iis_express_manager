# IIS Express Proje Yöneticisi - Teknik Dokümantasyon

Bu döküman, projenin teknik mimarisini, kod yapısını ve iş mantığını detaylı olarak açıklar. Herhangi bir yapay zeka aracının projeyi analiz edebilmesi için kapsamlı bilgi sağlar.

## 📋 Proje Özeti

**Amaç**: Windows'da IIS Express ile web projelerini yönetmek için Electron tabanlı masaüstü uygulaması  
**Platform**: Windows (IIS Express gereksinimi nedeniyle)  
**Teknoloji**: Electron.js, Node.js, HTML/CSS/JavaScript  
**Mimari**: İki işlemli (Main Process + Renderer Process)

## 🏗️ Teknik Mimari

### İşlem Modeli
```
┌─────────────────┐    IPC    ┌─────────────────┐
│   Main Process  │◄─────────►│ Renderer Process│
│   (Backend)     │           │   (Frontend)    │
│                 │           │                 │
│ - IIS Yönetimi  │           │ - UI Mantığı    │
│ - Port Kontrol  │           │ - Kullanıcı Etkileşimi │
│ - Dosya İşlem   │           │ - Event Handling │
│ - Ayar Yönetimi │           │                 │
└─────────────────┘           └─────────────────┘
```

### Dosya Yapısı ve Sorumluluklar

#### `main.js` - Ana İşlem (Backend)
**Sorumluluklar:**
- Electron BrowserWindow yönetimi
- IIS Express işlem yönetimi
- Port kontrolü ve atama
- Dosya sistemi işlemleri
- Ayar dosyası yönetimi
- IPC handler'ları

**Önemli Fonksiyonlar:**
```javascript
// Port kontrolü - TCP bağlantısı ile
function checkPort(port, host = '127.0.0.1')

// Benzersiz port oluşturma - MD5 hash
function generatePortForProject(projectPath, index)

// IIS Express işlem bulma
async function findIISProcessByPort(port)

// Zombie işlem temizleme
async function cleanupZombieProcesses()
```

#### `renderer.js` - Renderer İşlem (Frontend)
**Sorumluluklar:**
- DOM manipülasyonu
- Kullanıcı etkileşimi yönetimi
- UI güncelleme ve feedback
- IPC çağrıları
- Client-side filtreleme

**Önemli Fonksiyonlar:**
```javascript
// Projeleri yükle ve render et
async function loadProjects()

// Grid görünümde proje render
function renderProjects()

// UI durumu güncelleme
function updateProjectUI(id, status)

// Klasör seçimi ve validasyon
async function selectProjectsDirectory()
```

## 🔌 IPC (Inter-Process Communication) API

### Main Process Handler'ları

| Handler | Parametreler | Dönüş | Açıklama |
|---------|-------------|-------|----------|
| `get-projects` | - | `{projects, projectsDirectory}` \| `{error}` | Proje listesi ve durum bilgisi |
| `start-project` | `projectPath, port` | `{success, pid}` \| `{success: false, error}` | Proje başlatma |
| `stop-project` | `port` | `{success}` \| `{success: false, error}` | Proje durdurma |
| `stop-all-projects` | - | `{success}` | Tüm projeleri durdur |
| `open-browser` | `port` | `{success}` \| `{success: false, error}` | Tarayıcıda aç |
| `open-directory` | `dirPath` | `{success}` \| `{success: false, error}` | Dizini Windows Explorer'da aç |
| `select-projects-directory` | - | `{success, path}` \| `{success: false, error}` | Dizin seçimi |
| `get-settings` | - | `settings object` | Mevcut ayarları al |
| `update-settings` | `newSettings` | `{success, settings}` \| `{success: false, error}` | Ayarları güncelle |

### Hata Yönetimi Stratejisi
```javascript
// Tüm async operasyonlar try-catch ile sarılı
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.log('Operation failed:', error.message);
  return { success: false, error: error.message };
}
```

## 🔢 Port Yönetimi Algoritması

### Problem
Farklı dizinlerdeki projeler aynı port numaralarını kullanabilir, bu da çakışma yaratır.

### Çözüm
Her dizin için benzersiz port aralığı oluşturma:

```javascript
function generatePortForProject(projectPath, index) {
  // 1. Dizin yolunun MD5 hash'ini al
  const hash = crypto.createHash('md5').update(projectPath).digest('hex');
  
  // 2. Hash'in ilk 4 karakterini sayıya çevir
  const hashNum = parseInt(hash.substring(0, 4), 16);
  
  // 3. 8000-8999 aralığında base port oluştur
  const basePort = 8000 + (hashNum % 1000);
  
  // 4. Proje index'i ile son portu belirle
  return basePort + index;
}
```

**Örnek:**
- `D:/vhosts` → Hash: `a1b2` → Port Aralığı: 8274-8279
- `C:/projects` → Hash: `c3d4` → Port Aralığı: 8532-8537

## 🔄 Proje Yaşam Döngüsü

### 1. Uygulama Başlangıcı
```
1. Electron BrowserWindow oluştur
2. Zombie IIS Express işlemlerini temizle
3. Ayarları yükle (settings.json)
4. UI render et
5. Proje listesini yükle
```

### 2. Proje Başlatma Süreci
```
1. Port müsaitlik kontrolü
2. IIS Express varlık kontrolü  
3. spawn() ile işlem başlat
4. Port açılana kadar bekle (max 10s)
5. Başarı/hata durumunu döndür
6. UI güncelle
```

### 3. Proje Durdurma Süreci
```
1. Port aktiflik kontrolü
2. Portu kullanan IIS Express PID bul
3. taskkill ile işlemi sonlandır
4. Fallback: Tüm IIS Express'i temizle
5. UI güncelle
```

## 📁 Dosya ve Klasör Yapısı

### Proje Tanıma Kriterleri
```javascript
// Bir klasör proje sayılır eğer:
1. Dizin ise (isDirectory())
2. İçinde dosyalar varsa

// ASP projesi tanıma:
const asp = fs.existsSync(path.join(fullPath, 'default.asp'));
```

### Ayar Dosyası Yönetimi
```javascript
// settings.json yapısı:
{
  "projectsDirectory": "D:/vhosts"  // Kullanıcı tarafından seçilen dizin
}

// Varsayılan ayarlar:
const defaultSettings = {
  projectsDirectory: null  // İlk açılışta kullanıcı seçer
};
```

## 🎨 UI/UX Tasarım Prensipleri

### Grid Layout Sistemi
```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}
```

### Responsive Tasarım
- **Minimum kart genişliği**: 350px
- **Otomatik sütun ayarı**: `auto-fill`
- **Gap**: 16px (tutarlı boşluk)

### Durum Gösterimi
```javascript
// UI durumları:
- 'stopped'   → Durmuş (varsayılan)
- 'starting'  → Başlatılıyor (geçici)
- 'running'   → Çalışıyor
- 'stopping'  → Durduruluyor (geçici)
```

## 🔒 Güvenlik ve Performans

### Güvenlik Önlemleri
1. **Path Traversal Koruması**: Tüm dosya yolları validate edilir
2. **Process Isolation**: IIS Express işlemleri detached mode'da çalışır
3. **Error Sanitization**: Hata mesajları kullanıcı dostu hale getirilir

### Performans Optimizasyonları
1. **Asenkron İşlemler**: Tüm I/O operasyonları async
2. **Batch Operations**: Port kontrolü paralel yapılır
3. **UI Responsiveness**: Uzun işlemler background'da çalışır
4. **Memory Management**: child.unref() ile memory leak önlenir

### Resource Cleanup
```javascript
// Uygulama kapatılırken:
app.on('before-quit', () => {
  // Tüm IIS Express işlemlerini temizle
  cleanupAllProcesses();
});
```

## 🧪 Test Senaryoları

### Kritik Test Durumları
1. **Port Çakışması**: Aynı port farklı uygulamada kullanımda
2. **IIS Express Yok**: Program kurulu değil
3. **Geçersiz Dizin**: Seçilen dizin mevcut değil/erişilemez
4. **Network Hatası**: Port bağlantı sorunu
5. **Process Zombie**: IIS Express ölü ama port açık

### Hata Durumu Yönetimi
```javascript
// Her kritik operasyon için fallback mekanizması:
1. Primary approach (optimal)
2. Secondary approach (workaround)  
3. Cleanup approach (son çare)
4. User notification (bilgilendirme)
```

## 🔄 Versiyon Yönetimi

### Semantic Versioning
- **MAJOR**: Breaking changes (örn: IPC API değişimi)
- **MINOR**: Yeni özellikler (örn: yeni UI bileşeni)
- **PATCH**: Bug fixes (örn: port algoritması düzeltmesi)

### Changelog Mantığı
```
v1.0.0 - İlk stabil sürüm
- Temel proje yönetimi
- Grid UI
- Port management
- Settings persistence
```

## 🤖 AI/Yapay Zeka Entegrasyonu Notları

### Kod Analizi için İpuçları
1. **Entry Point**: `main.js` ve `renderer.js` ana dosyalar
2. **Business Logic**: IPC handler'larında bulunur
3. **UI Logic**: renderer.js'de DOM manipülasyonu
4. **Configuration**: settings.json ve package.json

### Genişletme Noktaları
1. **Yeni IPC Handler**: main.js'e ekle, renderer.js'den çağır
2. **UI Bileşeni**: HTML/CSS ekle, renderer.js'de handle et
3. **Yeni Ayar**: settings.json şemasını genişlet
4. **Business Logic**: main.js'e yeni fonksiyon ekle

Bu dokümantasyon, projenin her aspektini kapsayacak şekilde tasarlanmıştır ve gelecekteki geliştirmeler için rehber niteliği taşır.
