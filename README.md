# PixelGotchi PWA (Mobile – iPhone 8)
Tamagotchi-like game dạng PWA, giao diện tối ưu cho iPhone 8 (375×667).

## Cách triển khai nhanh (Netlify/Vercel/GitHub Pages)
1) Tải `pixelgotchi-pwa-mobile.zip` và giải nén.
2) Upload toàn bộ thư mục lên Netlify/Vercel/GitHub Pages.
3) Mở URL trên iPhone (Safari) → Share → **Add to Home Screen**.
4) Từ lần sau, mở từ Home Screen, game chạy **offline** nhờ service worker.

## Chạy thử local (máy tính)
```bash
cd pixelgotchi-pwa-mobile
python3 -m http.server 8082
```
Mở `http://localhost:8082`, có thể test PWA trên Chrome/Edge.

## Ghi chú PWA (iOS)
- Lần đầu cần online để Safari tải **index.html + app.js + style.css + manifest.json + sw.js**.
- Sau khi Add to Home, app chạy standalone; file được cache offline.
- Dữ liệu game lưu LocalStorage. Xoá app/clear Safari data sẽ mất save.
