# Changelog

Bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) standardını takip eder.

## [1.0.0] - 2025-06-28

### 🎉 İlk Stabil Sürüm - GitHub Release

#### 📦 Release Bilgileri
- **Windows Binary**: IIS-Express-Manager-v1.0.0-win-x64.zip (117.98 MB)
- **Platform**: Windows 10/11 (x64)
- **Electron Version**: 37.1.0
- **Kurulum**: Portable ZIP dosyası

#### ✨ Yeni Özellikler
- **IIS Express Yönetimi**: Projeleri tek tıkla başlatma/durdurma
- **Grid Görünüm**: Modern kart tabanlı proje listeleme
- **Port Yönetimi**: Benzersiz port atama algoritması
- **Klasör Seçimi**: Kullanıcı tarafından seçilebilir proje dizini
- **Ayar Saklama**: Seçilen ayarların kalıcı olarak saklanması
- **ASP Desteği**: Classic ASP projelerini otomatik tanıma
- **Zombie Temizleme**: Uygulama başlangıcında artık işlemleri temizler

#### 🎨 Kullanıcı Arayüzü
- **Responsive Grid**: Yan yana 3'lü proje kartları
- **İki Satırlı Butonlar**: Kompakt buton düzeni
- **Tooltip Sistemi**: Tüm butonlarda yardımcı açıklamalar
- **Durum Göstergesi**: Renk kodlu proje durumu
- **Notification**: Başarı/hata bildirimleri
- **Help System**: Kapsamlı kullanım kılavuzu

#### 🔧 Teknik Özellikler
- **Asenkron İşlemler**: UI donmaması için non-blocking operasyonlar
- **Port Algoritması**: MD5 hash tabanlı benzersiz port oluşturma
- **Hata Yönetimi**: Kapsamlı try-catch ve fallback mekanizmaları
- **IPC API**: 9 farklı backend-frontend iletişim kanalı
- **Process Management**: Güvenli IIS Express işlem yönetimi

#### 🚀 Performans
- **Hızlı Başlatma**: 500ms port kontrol timeout'u
- **Memory Management**: child.unref() ile memory leak önleme
- **Background Operations**: Uzun işlemler arkaplanda
- **Resource Cleanup**: Uygulama kapatılırken temizlik

#### 📁 Dosyalar
- **main.js**: Electron backend (342 satır)
- **renderer.js**: Frontend logic (377 satır)
- **index.html**: UI yapısı
- **style.css**: Modern CSS stilleri (430+ satır)
- **README.md**: Kapsamlı kullanıcı kılavuzu
- **ARCHITECTURE.md**: Teknik dokümantasyon

#### 🎯 Platform Desteği
- **Windows**: Tam destek (IIS Express gerekli)
- **Geliştirme**: Node.js 14+ gerekli
- **Electron**: v37.1.0

#### 🔒 Güvenlik
- **Path Validation**: Tüm dosya yolları doğrulanır
- **Process Isolation**: Detached mode işlem çalıştırma
- **Error Sanitization**: Güvenli hata mesajları

---

### 📊 İstatistikler
- **Toplam Kod**: ~1200+ satır
- **Dosya Sayısı**: 7 ana dosya
- **Özellik Sayısı**: 15+ ana özellik
- **Test Senaryosu**: 5 kritik durum

### 🙏 Teşekkürler
Bu sürümün geliştirilmesinde katkıda bulunan herkese teşekkürler!
