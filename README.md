# IIS Express Proje Yöneticisi

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hakansglm/iis_express_manager)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://github.com/hakansglm/iis_express_manager)
[![Electron](https://img.shields.io/badge/Electron-37.1.0-green.svg)](https://electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

**IIS Express Proje Yöneticisi**, Windows üzerinde IIS Express ile çalışan web projelerini kolayca yönetmenizi sağlayan modern ve kullanıcı dostu bir masaüstü uygulamasıdır. Proje dizinlerinizi seçin, projelerinizi tek tıkla başlatın veya durdurun, port çakışmalarını otomatik yönetin ve tüm projelerinizi şık bir grid arayüzde takip edin. Ayarlarınız ve tercihleriniz otomatik olarak kaydedilir, uygulama hem geliştirme hem de EXE olarak paketlenmiş şekilde sorunsuz çalışır. Kapsamlı hata yönetimi, port algoritması, anlık durum takibi ve yardım sistemiyle, IIS Express tabanlı geliştirme süreçlerinizi çok daha hızlı ve verimli hale getirir.

![Screenshot](screenshots/iis_express_manager_screenshot.jpg)

## 🚀 Özellikler

- **Proje Listesi**: Seçilen klasördeki tüm web projelerini otomatik olarak listeler
- **Hızlı Başlatma/Durdurma**: Tek tıkla IIS Express ile proje başlatma ve durdurma
- **Port Yönetimi**: Her proje için benzersiz port ataması (çakışma önleyici)
- **Durum Takibi**: Projelerin çalışıp çalışmadığını gerçek zamanlı gösterir
- **Tarayıcı Entegrasyonu**: Projeleri doğrudan tarayıcıda açma
- **Klasör Seçimi**: İlk açılışta veya dilediğinizde proje dizini seçimi
- **Ayar Saklama**: Seçilen dizin ve ayarlar otomatik olarak kaydedilir
- **Grid Görünüm**: Projeler grid düzeninde görüntülenir
- **ASP Desteği**: Classic ASP projelerini otomatik tanıma
- **Zombie Temizleme**: Artık IIS Express işlemlerini otomatik temizler

## 📦 Kurulum

### Gereksinimler
- **Windows 10/11**
- **IIS Express** (Visual Studio ile birlikte gelir)

### Kurulum Adımları

1. **Projeyi Klonlayın veya EXE'yi İndirin**
   - Kaynak koddan çalıştırmak için:
     ```bash
     git clone [repository-url]
     cd electronjs
     npm install
     npm start
     ```
   - Veya doğrudan EXE'yi indirin ve çalıştırın.

## 🎮 Kullanım

- Uygulamayı başlattığınızda ilk açılışta proje dizininizi seçmeniz istenir.
- Dilediğiniz zaman "Klasör Değiştir" butonuyla dizini değiştirebilirsiniz.
- Proje kartları üzerinden başlat/durdur, tarayıcıda aç, dizini aç gibi işlemleri yapabilirsiniz.

## 🏗️ Teknik Mimari

### Dosya Yapısı
```
electronjs/
├── main.js           # Electron ana işlem (backend)
├── renderer.js       # Renderer işlem (frontend)
├── index.html        # UI yapısı
├── style.css         # Stiller
├── package.json      # Proje konfigürasyonu
└── README.md         # Bu dosya
```

### Teknoloji Stack
- **Electron.js**: Masaüstü uygulama çerçevesi
- **Node.js**: Backend mantığı
- **HTML/CSS/JavaScript**: Frontend
- **IIS Express**: Web sunucusu

### Port Algoritması
```javascript
// Her dizin için benzersiz port aralığı
function generatePortForProject(projectPath, index) {
  const hash = crypto.createHash('md5').update(projectPath).digest('hex');
  const hashNum = parseInt(hash.substring(0, 4), 16);
  const basePort = 8000 + (hashNum % 1000);
  return basePort + index;
}
```

## 🔧 Konfigürasyon

### Ayarlar Dosyası
- **Konum:** Artık proje klasöründe değil, Electron'un userData dizininde (`C:/Users/KULLANICI/AppData/Roaming/iis-express-manager/settings.json`)
- **Otomatik oluşur ve güncellenir.**
- Örnek içerik:
```json
{
  "projectsDirectory": "C:/Projelerim"
}
```

## 🐛 Sorun Giderme

- **IIS Express Bulunamadı:** IIS Express'in kurulu olduğundan emin olun. Varsayılan yol: `C:/Program Files/IIS Express/iisexpress.exe`
- **Port Çakışması:** Uygulama her dizin için farklı port aralığı kullanır. Çakışma durumunda uygulamayı yeniden başlatın.
- **Ayarlar Kaydedilemiyor:** EXE ile çalıştırırken ayarlar dosyası otomatik olarak yazılabilir dizine kaydedilir. Yine de hata alırsanız uygulamayı yönetici olarak çalıştırmayı deneyin.

## 📄 Lisans

Bu proje MIT lisansı ile sunulmaktadır.

---

**Geliştirici**: Hakan Murat SAĞLAM  
**Versiyon**: 1.0.0  
**Son Güncelleme**: 2025-06-29
