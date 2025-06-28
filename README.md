# IIS Express Proje Yöneticisi

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hakansglm/iis_express_manager)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://github.com/hakansglm/iis_express_manager)
[![Electron](https://img.shields.io/badge/Electron-37.1.0-green.svg)](https://electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)Express Proje Yöneticisi

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hakansglm/iis-express-manager)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://github.com/hakansglm/iis-express-manager)
[![Electron](https://img.shields.io/badge/Electron-37.1.0-green.svg)](https://electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

Modern ve kullanıcı dostu bir IIS Express proje yönetim aracı. Electron.js ile geliştirilmiş, Windows için optimize edilmiş bir masaüstü uygulamasıdır.

![Screenshot](docs/screenshot.png)

## 🚀 Özellikler

### 🎯 Temel Özellikler
- **Proje Listesi**: Seçilen klasördeki tüm web projelerini otomatik olarak listeler
- **Hızlı Başlatma**: Tek tıkla IIS Express ile proje başlatma
- **Port Yönetimi**: Her proje için benzersiz port ataması
- **Durum Takibi**: Projelerin çalışıp çalışmadığını gerçek zamanlı gösterir
- **Tarayıcı Entegrasyonu**: Projeleri doğrudan tarayıcıda açma

### 🔧 Gelişmiş Özellikler
- **Klasör Seçimi**: Proje dizinini serbestçe değiştirme
- **Ayar Saklama**: Seçilen dizin kalıcı olarak saklanır
- **Grid Görünüm**: Projeler grid düzeninde görüntülenir
- **Filtreleme**: Proje adına göre anlık filtreleme
- **ASP Desteği**: Classic ASP projelerini otomatik tanıma

### ⚡ Performans & Güvenilirlik
- **Asenkron İşlemler**: UI donmaması için tüm işlemler asenkron
- **Zombie Temizleme**: Uygulama başlangıcında artık işlemleri temizler
- **Port Çakışması Önleme**: Farklı dizinler için benzersiz port aralıkları
- **Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı bildirimi

## 📦 Kurulum

### Gereksinimler
- **Windows 10/11**
- **Node.js** (v14 veya üzeri)
- **IIS Express** (Visual Studio ile birlikte gelir)

### Kurulum Adımları

1. **Projeyi Klonlayın**
   ```bash
   git clone [repository-url]
   cd electronjs
   ```

2. **Bağımlılıkları Yükleyin**
   ```bash
   npm install
   ```

3. **Uygulamayı Başlatın**
   ```bash
   npm start
   ```

## 🎮 Kullanım

### İlk Kurulum
1. Uygulamayı başlattığınızda varsayılan olarak `D:/vhosts` dizini seçilir
2. Farklı bir dizin kullanmak istiyorsanız **"Klasör Değiştir"** butonuna tıklayın
3. Proje dizininizi seçin - bu ayar kalıcı olarak saklanır

### Proje Yönetimi
- **🟢 Başlat**: Projeyi IIS Express ile çalıştırır
- **🔴 Durdur**: Çalışan projeyi güvenli şekilde durdurur
- **🌐 Aç**: Projeyi varsayılan tarayıcıda açar
- **⏹️ Tümünü Durdur**: Tüm çalışan projeleri durdurur

### Filtreleme
- Üst kısımdaki arama kutusuna proje adı yazarak filtreleme yapabilirsiniz
- Filtreleme anlık olarak çalışır

## 🏗️ Teknik Mimari

### Dosya Yapısı
```
electronjs/
├── main.js           # Electron ana işlem (backend)
├── renderer.js       # Renderer işlem (frontend)
├── index.html        # UI yapısı
├── style.css         # Stiller
├── package.json      # Proje konfigürasyonu
├── settings.json     # Kullanıcı ayarları (otomatik oluşur)
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

### Ayarlar Dosyası (`settings.json`)
```json
{
  "projectsDirectory": "D:/vhosts"
}
```

### Varsayılan Ayarlar
- **Proje Dizini**: `D:/vhosts`
- **Port Aralığı**: 8000-8999
- **Timeout**: 10 saniye (proje başlatma için)

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**1. IIS Express Bulunamadı**
- IIS Express'in kurulu olduğundan emin olun
- Varsayılan yol: `C:/Program Files/IIS Express/iisexpress.exe`

**2. Port Çakışması**
- Uygulama her dizin için farklı port aralığı kullanır
- Çakışma durumunda uygulamayı yeniden başlatın

**3. Proje Başlatılamıyor**
- Proje dizininin geçerli olduğundan emin olun
- Yönetici olarak çalıştırmayı deneyin

### Debug Modu
Uygulama konsolunda detaylı loglar gösterilir:
```bash
# Konsolu açmak için
Ctrl + Shift + I (Developer Tools)
```

## 🤝 Katkıda Bulunma

### Geliştirme Ortamı
1. Repository'yi fork edin
2. Değişikliklerinizi yapın
3. Pull request oluşturun

### Kod Standartları
- ESLint kurallarına uyun
- Async/await kullanın
- Hata yakalama ekleyin
- Kod yorumları yazın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- **Electron.js** topluluğuna
- **IIS Express** ekibine
- Tüm katkıda bulunanlara

---

**Geliştirici**: hakansglm  
**Versiyon**: 1.0.0  
**Son Güncelleme**: 2025-06-28
