# 🕌 Hocaya Sor — Mobil Uygulama

**Diyanet fetva veritabanına dayanan RAG backend'i için React Native (Expo) istemcisi.**

Kullanıcı e-posta ile kayıt olup hesabını doğruladıktan sonra giriş yapar, sorularını sorar ve backend'in ürettiği kaynaklı cevapları sohbet arayüzünde görür. Her cevaba like/dislike geri bildirimi verilebilir; dislike durumunda isteğe bağlı yorum eklenebilir.

---

## 📑 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
- [Yapılandırma](#️-yapılandırma)
- [Proje Yapısı](#-proje-yapısı)
- [Mimari Notlar](#-mimari-notlar)
- [Ekranlar](#-ekranlar)
- [Paylaşılan Bileşenler](#-paylaşılan-bileşenler)
- [Tema](#-tema)
- [Geliştirme](#-geliştirme)

---

## ✨ Özellikler

- 🔐 **JWT tabanlı kimlik doğrulama** — kayıt, giriş, e-posta doğrulama (6 haneli kod)
- 🔄 **Access + refresh token akışı** — refresh token `expo-secure-store` ile cihazda güvenli saklanır
- 💬 **Sohbet arayüzü** — soru sor, kaynaklı cevap al
- 👍👎 **Like/Dislike geri bildirimi** — dislike'a özel yorum kutusu
- 🎨 **Karanlık + altın (luxury) tema** — gece rengi zemin, altın vurgular, yıldızlı hero bölümü
- 📋 **Panoya kopyalama** — `expo-clipboard` ile cevap/kaynak kopyalama
- 📱 **Tek kod tabanı, üç platform** — iOS, Android, Web (Expo + `react-native-web`)

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Expo 54 (React Native 0.81) |
| Dil | TypeScript 5.9 |
| UI | React 19 |
| Navigasyon | `@react-navigation/native` + `native-stack` |
| HTTP | axios |
| İkonlar | `@expo/vector-icons` (Ionicons) |
| Güvenli depolama | `expo-secure-store` (refresh token) |
| Panoya kopyalama | `expo-clipboard` |
| Platform desteği | iOS, Android, Web (`react-native-web`) |

---

## 🚀 Kurulum

### Gereksinimler

- Node.js (LTS önerilir)
- Expo CLI (`npx expo`, ayrı kurulum gerekmez)
- Çalışan bir Hocaya Sor backend'i (bkz. backend README — `/api/v1/...` endpoint'leri)
- iOS/Android için Expo Go uygulaması, ya da bir emülatör

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Backend adresini yapılandır

Bkz. [Yapılandırma](#️-yapılandırma).

### 3. Geliştirme sunucusunu başlat

```bash
npm start
```

Ardından:

```bash
npm run ios       # iOS simülatörü
npm run android   # Android emülatörü
npm run web       # Tarayıcı
```

Fiziksel bir cihazda test etmek için Expo Go ile QR kodu okut (telefon ve geliştirme makinesi aynı ağda olmalı).

---

## ⚙️ Yapılandırma

> ⚠️ **Doldurulması gereken kısım:** API base URL şu an hangi dosyada / hangi değişken adıyla tutuluyor net değil (`src/api/` altında olması muhtemel). Expo'da ortam değişkenleri istemci tarafında kullanılacaksa `EXPO_PUBLIC_` öneki taşımalı, örn:

```env
# .env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Fiziksel cihazdan test ederken `localhost` yerine geliştirme makinesinin yerel ağ IP'si kullanılmalı (örn. `http://192.168.1.x:8000/api/v1`), aksi halde cihaz backend'e ulaşamaz.

`app.json` içindeki `expo-secure-store` plugin'i refresh token'ın cihazda şifreli olarak saklanmasını sağlar; ek bir yapılandırma gerektirmez.

---

## 📁 Proje Yapısı

```
hocaya_sor_temp/
├── app.json                  # Expo yapılandırması (icon, splash, plugin'ler)
├── package.json
├── index.ts                  # Uygulama giriş noktası
├── assets/                   # İkon, splash, favicon görselleri
└── src/
    ├── api/                  # axios instance, endpoint çağrıları
    ├── components/           # Paylaşılan UI bileşenleri
    │   ├── AuthScreenLayout.tsx
    │   ├── AuthHero.tsx
    │   ├── FormInput.tsx
    │   ├── AuthButton.tsx
    │   └── Banner.tsx
    ├── context/
    │   └── AuthContext.tsx   # login/register/verifyEmail/resendVerification, token yönetimi
    ├── navigation/
    │   └── types.ts          # AuthStackParamList vb. navigasyon tipleri
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── VerifyEmailScreen.tsx
    │   └── HomeScreen.tsx    # Sohbet arayüzü + feedback
    ├── theme/
    │   ├── colors.ts         # Gece/altın renk paleti
    │   ├── stars.ts          # Hero'daki dekoratif yıldız dizisi
    │   └── index.ts          # Barrel export
    └── types/
        └── auth.ts           # Auth tipleri, extractErrorMessage yardımcı fonksiyonu
```

---

## 🏗 Mimari Notlar

- **Auth akışı:** `AuthContext`, backend'in access/refresh token modeline uyacak şekilde tasarlanmıştır. Access token kısa ömürlü olduğundan, süresi dolduğunda backend'in `/auth/refresh` endpoint'i kullanılarak sessizce yenilenmesi beklenir (axios interceptor önerilir, henüz doğrulanmadı).
- **E-posta doğrulama:** Kayıt sonrası kullanıcı doğrudan `VerifyEmailScreen`'e yönlendirilir; 6 haneli kod kutuları tek bir gizli `TextInput` üzerinden yönetilir (native OTP davranışı taklit edilir).
- **Doğrulanmamış hesapla giriş:** Backend `403 EMAIL_NOT_VERIFIED` döndüğünde `LoginScreen`, kullanıcıyı `VerifyEmailScreen`'e yönlendiren bir link gösterir.
- **Feedback:** `HomeScreen`'de her cevaba like/dislike verilebilir; `dislike` seçildiğinde backend'deki `comment` alanına karşılık gelen bir yorum kutusu açılır ve `/fatwa/feedback/{log_id}` endpoint'ine gönderilir.
- **Refresh token güvenliği:** `expo-secure-store` ile cihazın güvenli depolama alanında (iOS Keychain / Android Keystore) tutulur; düz metin olarak AsyncStorage'a yazılmaz.

---

## 📱 Ekranlar

| Ekran | Açıklama |
|---|---|
| `LoginScreen` | E-posta/şifre ile giriş, doğrulanmamış hesap için yönlendirme linki |
| `RegisterScreen` | Yeni hesap oluşturma (min. 8 karakter şifre kuralı) |
| `VerifyEmailScreen` | 6 haneli kod girişi, yeniden gönderim (cooldown'lu) |
| `HomeScreen` | Soru-cevap sohbet arayüzü, like/dislike + yorum |

---

## 🧩 Paylaşılan Bileşenler

Auth ekranları (Login/Register/VerifyEmail) ortak bir görsel dilden gelir:

- **`AuthScreenLayout`** — StatusBar + KeyboardAvoidingView + ScrollView + hero/kart kabuğu
- **`AuthHero`** — yıldızlı gece temalı üst bölüm (niş + ikon + eyebrow + wordmark)
- **`FormInput`** — ikonlu, odak (focus) durumunu kendi içinde yöneten input
- **`AuthButton`** — basılınca gölgesi kalkan 3D altın buton
- **`Banner`** — hata (error) / bilgi (info) varyantlı uyarı kutusu

`HomeScreen` yapısal olarak farklı olduğu için (sohbet arayüzü) bu layout bileşenlerini kullanmaz, yalnızca ortak `theme` renklerini paylaşır.

---

## 🎨 Tema

`src/theme/colors.ts` içinde tanımlı gece + altın (luxury) paleti:

| Değişken | Hex | Kullanım |
|---|---|---|
| `night` | `#0E2A21` | Ana zemin (koyu yeşil-siyah) |
| `nightDeep` | `#081D16` | Daha koyu zemin katmanı |
| `gold` | `#D4A853` | Vurgu, ikon, buton üstü |
| `goldDeep` | `#A97A2E` | Buton gölgesi, odaklanmış input kenarlığı |
| `cream` | `#FBF6EC` | Kart zemini |
| `ink` | `#132A22` | Ana metin rengi |
| `muted` | `#8FA79B` | İkincil/soluk metin |
| `error` | `#D9534F` | Hata banner'ı |

`stars.ts` içindeki `STARS` dizisi, hero bölümündeki dekoratif noktaların konum/boyut/opaklığını sabit olarak tutar.

---

## 🧑‍💻 Geliştirme

### Yeni bir auth ekranı eklerken

`AuthScreenLayout` + `FormInput` + `AuthButton` + `Banner` bileşenlerini kullan; renk için asla hardcoded hex girme, `theme`'den import et.

### Yeni bir tema rengi eklerken

`src/theme/colors.ts`'e ekle, `index.ts` zaten barrel export yaptığı için ek bir işlem gerekmez.

### TypeScript hataları

Ionicons `name` prop'u tip hatası veriyorsa, kullanılan ikon adının güncel `@expo/vector-icons` sürümünde (`^15.0.3`) mevcut olduğundan emin ol.

---

## 📜 Lisans

Apache-2.0 license