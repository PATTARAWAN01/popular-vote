# 🌿 Popular Vote - การประกวดชุดรีไซเคิล (Recycled Outfit Popular Vote)

ระบบ Popular Vote แบบเรียลไทม์สำหรับการประกวดชุดรีไซเคิล แยกการโหวตเป็น **ม.ต้น** และ **ม.ปลาย** พร้อมระบบเช็คอินตำแหน่งพิกัด GPS รัศมี 40 เมตร และรีเช็คสิทธิ์ด้วยรหัสนักเรียน 5 หลัก

---

## ⚡ คุณสมบัติของระบบ (Features)

1. **โหวตแยกหมวดหมู่**:
   - ระดับ ม.ต้น
   - ระดับ ม.ปลาย
   - สิทธิ์การโหวต: นักเรียน 1 คน (ตามรหัส 5 หลัก) โหวตได้ระดับละ 1 ครั้ง

2. **เช็คอินพิกัด GPS 40 เมตร (Geolocation Check-in)**:
   - ตรวจสอบตำแหน่งผู้โหวตด้วย GPS (คำนวณผ่าน Haversine formula)
   - ผู้โหวตต้องอยู่ในรัศมีไม่เกิน 40 เมตร จากพิกัดที่แอดมินตั้งไว้

3. **แสดงผล Real-time & อนิเมชัน (Real-time Leaderboard)**:
   - อัปเดตคะแนนสดขยับแบบเรียลไทม์
   - หน้าผลคะแนนสด `/leaderboard` พร้อมแท่นรับรางวัลอันดับ 1-3 (🥇 🥈 🥉)
   - เอฟเฟกต์พลุกระดาษ (Confetti) เมื่อลงคะแนนสำเร็จ

4. **นาฬิกานับถอยหลังปิดโหวต (Countdown Timer)**:
   - แสดงเวลานับถอยหลังจนกว่าจะปิดโหวต
   - ระบบปิดการโหวตอัตโนมัติเมื่อครบเวลา หรือปิดด้วยมือผ่านหน้าแอดมิน

5. **ระบบหลังบ้าน (Admin Back-office)**:
   - URL: `/admin` (รหัสผ่านเข้าใช้งาน: `nwsp1234`)
   - แยกการจัดการ ม.ต้น และ ม.ปลาย ชัดเจน
   - เพิ่ม/แก้ไข/ลบ หมายเลข ชื่อ รายละเอียด และรูปภาพผู้สมัคร
   - นำเข้ารหัสนักเรียน 5 หลักด้วยไฟล์ CSV หรือเพิ่มรายบุคคล
   - กำหนดพิกัด GPS (ดึงตำแหน่งแอดมินอัตโนมัติ) และเวลานับถอยหลัง

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Local Development)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. สร้างไฟล์ `.env.local` จากตัวอย่าง `.env.local.example` (ใส่ค่า Firebase credentials):
   ```bash
   cp .env.local.example .env.local
   ```

3. รันเซิร์ฟเวอร์ทดสอบ:
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## ☁️ การนำขึ้น Cloudflare Pages ผ่าน GitHub

1. ผลักดันโค้ดขึ้น GitHub Repository ของคุณ
2. ไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. เลือก Repository นี้
4. ตั้งค่า Build Settings:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. เพิ่ม Environment Variables ใน Cloudflare Pages (ถ้าต้องการซิงก์กับ Firebase):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - (และอื่นๆ ตาม `.env.local.example`)
6. กด **Save and Deploy**!

---

## 🔑 ข้อมูลรหัสผ่าน & Test Credentials
- **Admin Password**: `nwsp1234`
- **รหัสนักเรียนสำหรับทดสอบโหวต (Mock Data)**: `11111`, `22222`, `33333`, `12345`
