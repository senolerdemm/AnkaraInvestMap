# EstechEngineers
Ankara Invest Map — Kurulum ve Çalıştırma Rehberi

Bu proje; .NET 8 (Web API) tabanlı bir backend ve Vite + React tabanlı bir frontend’ten oluşur. Aşağıdaki adımları sırasıyla izleyerek projeyi yerelde ayağa kaldırabilirsiniz.

Başlangıç: 
# 1) Projeyi klonla
git clone https://github.com/senolerdemm/AnkaraInvestMap.git
cd AnkaraInvestMap

# 2) Backend için:
cd backend
.env dosyası için Drive linki: https://drive.google.com/file/d/1LJMhA_-0WvEyFE-01GLhNG6GprhNRJoz/view?usp=sharing
.env dosyasını (Drive'dan) backend kök dizinine kopyala (EstechApi.csproj ile aynı klasör) 
Gizli dosya olduğu için Visual Studio Solution Explorer da listelenmeyebilir.

# 3) Backend’i çalıştır
EstechApi.csproj dosyasını başlangıç ögesi olarak seçin
dotnet restore
dotnet run
# -> http://localhost:5005  (Swagger: /swagger)

# 4) Frontend’i çalıştır
cd frontend
npm install
npm run dev
# -> http://localhost:5173

📦 Kullanılan Teknolojiler

Backend

.NET 8 (ASP.NET Core Web API)

NuGet paketleri:

CsvHelper (33.1.0)

DotNetEnv (3.1.1) – .env desteği

Microsoft.AspNetCore.OpenApi (8.0.16)

Newtonsoft.Json (13.0.3)

Swashbuckle.AspNetCore (6.6.2) – Swagger UI

Frontend

React + Vite

NPM

✅ Ön Koşullar

.NET SDK 8.0+
Kontrol: dotnet --info

Node.js (LTS) ve npm
Kontrol: node -v ve npm -v

Git

Visual Studio 2022 (isteğe bağlı, backend’i IDE üzerinden açmak için)
veya VS Code

📁 Önerilen Dizin Yapısı (Özet)
AnkaraInvestMap/
├─ backend kök (EstechApi.csproj burada)
│  ├─ Controllers/
│  ├─ Data/
│  │  └─ TarımHayvancilik/
│  ├─ Models/
│  ├─ Services/
│  ├─ appsettings.json
│  ├─ .env        <-- Drive’dan gelen dosya (gizli dosya olduğu için Visual Studio Solution Explorer da listelenmeyebilir)
│  └─ ...
└─ frontend/
   ├─ src/
   ├─ index.html
   ├─ package.json
   └─ ...

🔧 Sık Karşılaşılan Sorunlar & Çözümleri

Port zaten kullanımda (5005 veya 5173):
Başka bir örnek çalışıyorsa kapatın veya portu değiştirin.
Windows’ta portu kullanan işlemi bulmak için:

netstat -ano | findstr :5005
taskkill /PID <PID> /F


CORS Hatası (Tarayıcıda API çağrıları):
API adresinin http://localhost:5005 olduğundan emin olun. Gerekirse backend’de CORS politikası ekleyin veya frontend’te proxy ayarlayın.

DotNet paket sorunları:

dotnet restore --no-cache
dotnet clean
dotnet build


Node versiyon uyumsuzluğu:
LTS sürüme geçin (örn. 18.x/20.x) ve node_modules klasörünü silip tekrar npm install çalıştırın.

🧪 Doğrulama

Backend: http://localhost:5005/swagger sayfası açılıyorsa API çalışıyor demektir.

Frontend: http://localhost:5173 açılıyor ve sayfa düzgün render ediliyorsa arayüz hazırdır.
