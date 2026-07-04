# Bu dosyaları nereye koyacaksın

Önceki oturumda yazdığın dosyalarla aynı `src/` yapısını varsaydım
(screens'ten `../navigation/types`, `../context/AuthContext` importları buna göre):

```
proje-kökü/
├── App.tsx                          ← bunu proje kökündeki App.tsx ile DEĞİŞTİR
└── src/
    ├── types/
    │   ├── auth.ts                  (zaten vardı)
    │   └── fatwa.ts                 ← YENİ
    ├── api/
    │   ├── tokenStorage.ts          (zaten vardı)
    │   ├── client.ts                (zaten vardı)
    │   ├── authApi.ts               (zaten vardı)
    │   └── fatwaApi.ts              ← YENİ
    ├── context/
    │   └── AuthContext.tsx          (zaten vardı)
    ├── navigation/
    │   ├── types.ts                 ← YENİ
    │   └── RootNavigator.tsx        ← YENİ
    └── screens/
        ├── RegisterScreen.tsx       (zaten vardı)
        ├── LoginScreen.tsx          (zaten vardı)
        ├── VerifyEmailScreen.tsx    ← YENİ
        └── HomeScreen.tsx           ← YENİ
```

## Kurulman gereken paketler

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-secure-store expo-status-bar
npm install axios
```

(`npx expo install` kullanmanı öneririm — Expo SDK'na uygun versiyonları otomatik seçer, `npm install` ile versiyon uyuşmazlığı riskine girmezsin.)

## `.env` dosyası

Projenin kökünde `.env` dosyasına (yoksa oluştur):

```
EXPO_PUBLIC_API_URL=http://<BACKEND_IP>:8000/api/v1
```

Fiziksel telefon/Expo Go ile test ediyorsan `localhost` çalışmaz — bilgisayarının
yerel ağ IP'sini yaz (örn. `192.168.1.34`), backend'in de o arayüzde dinlediğinden
emin ol (`uvicorn main:app --host 0.0.0.0 --port 8000`).

## Notlar / varsayımlar (yanlışsa söyle, düzeltirim)

- **VerifyEmailScreen**: resend butonuna 30 saniyelik client-side cooldown koydum
  (backend zaten 3/dk limitliyor, bu sadece kullanıcının erken 429 yemesini önlüyor).
  İstersen kaldırabilir ya da süresini değiştirebilirim.
- **HomeScreen**: `top_k` sabit 5 gönderiyor, kullanıcıya seçtirmiyorum. İstersen bir
  slider/seçici ekleyebilirim.
- **Feedback hatası**: like/dislike başarısız olursa sessizce yutuyorum (kritik akış
  değil). İstersen küçük bir toast/uyarı ekleyebilirim.
- **Logout**: HomeScreen header'ında basit bir metin link olarak koydum, tasarımı
  istediğin gibi değiştirebiliriz (ikon, ayarlar sayfası vs.).
- React Navigation'da `native-stack` kullandım (senin önceki `RegisterScreen`/
  `LoginScreen` importları `@react-navigation/native-stack`'e göre tipliydi, o yüzden
  tutarlılık için devam ettim).
