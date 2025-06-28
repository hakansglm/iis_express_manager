# IIS Express Manager v1.0.0 Release Notes

## 🎉 İlk Sürüm - v1.0.0

Modern ve kullanıcı dostu IIS Express proje yönetim aracının ilk stabil sürümü!

### ✨ Özellikler

- **Grid görünüm** ile projelerinizi düzenli şekilde görüntüleyin
- **Klasör seçimi**: İlk açılışta veya dilediğinizde proje dizini seçimi
- **Ayarlar**: Seçimleriniz otomatik olarak kaydedilir (artık Electron userData dizininde, EXE ile tam uyumlu)
- **Tek tıkla başlatma/durdurma**: Hızlı ve güvenilir IIS Express yönetimi
- **Benzersiz port algoritması**: Port çakışması yok
- **Toplu durdurma**: Tüm sunucuları tek seferde durdurun
- **Tarayıcıda açma ve dizini açma**: Projeyi tarayıcıda veya Explorer'da açın
- **Kapsamlı hata yönetimi ve bildirimler**

### Teknik Detaylar
- **Electron.js** ile geliştirildi
- **Windows 10/11** desteği
- **Node.js >=14.0.0** gereksinimi
- **Ayarlar dosyası**: `C:/Users/KULLANICI/AppData/Roaming/iis-express-manager/settings.json`
- **Asenkron işlem yönetimi**
- **MD5 hash tabanlı port algoritması**

### Kurulum
1. [IIS-Express-Manager-v1.0.0-win-x64.zip](https://github.com/hakansglm/iis_express_manager/releases/download/v1.0.0/IIS-Express-Manager-v1.0.0-win-x64.zip) dosyasını indirin
2. ZIP dosyasını istediğiniz klasöre çıkarın
3. `IIS Express Manager.exe` dosyasını çalıştırın

### Kullanım
- İlk açılışta proje dizininizi seçin
- Listeden istediğiniz projeyi seçin ve başlatın
- Tarayıcıda göster veya dizini aç ile hızlı erişim

### Bilinen Sorunlar
- Code signing sertifikası olmadığı için Windows Defender uyarısı gösterebilir
- İlk açılışta güvenlik uyarısı çıkarsa "Yine de çalıştır" seçeneğini kullanın

---

**Geliştirici:** hakansglm  
**Lisans:** MIT  
**Repository:** https://github.com/hakansglm/iis_express_manager  
**Hata bildirimi:** https://github.com/hakansglm/iis_express_manager/issues
