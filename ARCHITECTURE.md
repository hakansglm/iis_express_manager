# IIS Express Proje Yöneticisi - Teknik Dokümantasyon

Bu doküman, projenin teknik mimarisini, kod yapısını ve iş mantığını açıklar.

## Proje Özeti

**Amaç**: Windows'da IIS Express ile web projelerini yönetmek için Electron tabanlı masaüstü uygulama  
**Platform**: Windows (IIS Express gereksinimi nedeniyle)  
**Teknoloji**: Electron.js, Node.js, HTML/CSS/JavaScript  
**Mimari**: İki işlemli (Main Process + Renderer Process)

## Teknik Mimari

### İşlem Modeli
```
┌───────────────────┐    IPC    ┌───────────────────┐
│   Main Process    │◄────────►│ Renderer Process  │
│   (Backend)       │           │   (Frontend)      │
│ - IIS Yönetimi    │           │ - UI Mantığı      │
│ - Port Kontrol    │           │ - Kullanıcı Etk.  │
│ - Dosya İşlem     │           │ - Event Handling  │
│ - Ayar Yönetimi   │           │                   │
└───────────────────┘           └───────────────────┘
```

### Dosya Yapısı ve Sorumluluklar

#### `main.js` - Ana İşlem (Backend)
- Electron BrowserWindow yönetimi
- IIS Express işlem yönetimi
- Port kontrolü ve atama
- Dosya sistemi işlemleri
- Ayar dosyası yönetimi (Artık Electron userData dizininde, platformdan bağımsız yazılabilir)
- IPC handler'ları

#### `renderer.js` - Renderer İşlem (Frontend)
- DOM manipülasyonu
- Kullanıcı etkileşimi yönetimi
- UI güncelleme ve feedback
- IPC çağrıları
- Client-side filtreleme

## Ayar Yönetimi

- **settings.json** dosyası artık Electron'un userData dizininde tutulur:  
  `C:/Users/KULLANICI/AppData/Roaming/iis-express-manager/settings.json`
- İlk açılışta veya dilediğinizde proje dizini seçimi yapılır, ayar otomatik kaydedilir.
- EXE ve geliştirme ortamında aynı şekilde çalışır.

## Port Algoritması

```javascript
function generatePortForProject(projectPath, index) {
  const hash = crypto.createHash('md5').update(projectPath).digest('hex');
  const hashNum = parseInt(hash.substring(0, 4), 16);
  const basePort = 8000 + (hashNum % 1000);
  return basePort + index;
}
```

## IPC (Inter-Process Communication) API

- Proje listesi, klasör seçimi, başlat/durdur, ayar güncelleme gibi işlemler için ana işlem ve renderer arasında güvenli iletişim sağlanır.

---

Daha fazla detay için kaynak kodu ve README.md dosyasını inceleyebilirsiniz.
