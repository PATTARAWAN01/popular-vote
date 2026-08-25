# 🚀 คู่มือขั้นตอนอย่างละเอียด: เชื่อมต่อ Firebase & นำระบบขึ้น Cloudflare Pages ผ่าน GitHub

คู่มือนี้สรุปขั้นตอนการตั้งค่าฐานข้อมูล **Firebase (ฟรี 100% ไม่ต้องผูกบัตรเครดิต)** และการนำเว็บไซต์ขึ้นใช้งานจริงบน **Cloudflare Pages** ผ่าน **GitHub** สำหรับระบบ Popular Vote การประกวดชุดรีไซเคิล โรงเรียนหนองวัวซอพิทยาคม

---

## 📌 ส่วนที่ 1: การตั้งค่า Firebase (ฟรี 100% บนแผน Spark - ไม่ต้องผูกบัตรเครดิต)

### ขั้นตอนที่ 1.1: สร้าง Firebase Project
1. เข้าไปที่เว็บ [Firebase Console](https://console.firebase.google.com/) แล้วเข้าสู่ระบบด้วย Google Account
2. กดปุ่ม **"Add project"** (หรือ **"สร้างโปรเจกต์"**)
3. ตั้งชื่อโปรเจกต์ เช่น `nwsp-popular-vote` แล้วกด **Continue**
4. หน้า Google Analytics กด **Continue** (หรือปิด Analytics) แล้วกด **Create project**
5. รอระบบสร้างโปรเจกต์สักครู่ แล้วกด **Continue**

### ขั้นตอนที่ 1.2: เปิดใช้งาน Cloud Firestore (ฐานข้อมูล Real-time)
1. ในเมนูด้านซ้าย เลือก **Build** > **Firestore Database**
2. กดปุ่ม **"Create database"**
3. เลือก Location เป็น `asia-southeast1 (Singapore)` แล้วกด **Next**
4. ในหน้าการตั้งค่า Rules เลือก **"Start in test mode"** แล้วกด **Create**

> 💡 **หมายเหตุเรื่องรูปภาพผู้สมัคร (Storage)**: 
> คุณ **ไม่ต้องข้ามไปเปิด Firebase Storage และไม่ต้องผูกบัตรเครดิต (Blaze Plan)** ใดๆ ทั้งสิ้น! ระบบมี **Auto Image Compression** ในตัวเว็บ เมื่อแอดมินอัปโหลดรูปภาพผู้สมัคร ระบบจะย่อขนาดให้อัตโนมัติเหลือไฟล์เล็กมาก (~50KB) และบันทึกลงใน Cloud Firestore หรือวางลิงก์รูปภาพโดยตรงได้ทันที ฟรี 100%!

### ขั้นตอนที่ 1.3: คัดลอกค่า Firebase Configuration
1. ไปที่ไอคอนรูปฟันเฟือง ⚙️ ด้านบนซ้าย เลือก **Project settings**
2. เลื่อนลงมาล่างสุด ตรงหัวข้อ *"Your apps"* กดเลือกไอคอนเว็บ **`</>` (Web)**
3. ตั้งชื่อแอป เช่น `popular-vote-web` แล้วกด **Register app**
4. คัดลอกค่าความปลอดภัย 6 บรรทัดนี้ไว้:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nwsp-popular-vote.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nwsp-popular-vote
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nwsp-popular-vote.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...:web:...
```

### ขั้นตอนที่ 1.4: ใส่ค่าในโปรเจกต์ (สำหรับรันทดสอบในเครื่อง)
1. เปิดโฟลเดอร์โปรเจกต์ `d:\WEB APP\Popular Vote`
2. สร้างไฟล์ชื่อ `.env.local`
3. วางค่าทั้ง 6 บรรทัดลงในไฟล์ แล้วกด Save

---

## 📌 ส่วนที่ 2: การเอาโค้ดขึ้น GitHub

1. สร้าง Repository ใหม่บนเว็บไซต์ [GitHub](https://github.com/new) ตั้งชื่อว่า `popular-vote`
2. เปิด Terminal ในโฟลเดอร์โปรเจกต์ `d:\WEB APP\Popular Vote` แล้วรันคำสั่ง:

```bash
git init
git add .
git commit -m "Initial commit popular vote app"
git branch -M main
git remote add origin https://github.com/USERNAME/popular-vote.git
git push -u origin main
```
*(เปลี่ยน `USERNAME` เป็นชื่อบัญชี GitHub ของคุณ)*

---

## 📌 ส่วนที่ 3: การ Deploy ขึ้น Cloudflare Pages

### 3.1 เชื่อมต่อ Cloudflare กับ GitHub
1. เข้าไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com/) แล้วล็อกอินเข้าสู่ระบบ
2. ในเมนูด้านซ้าย เลือก **Workers & Pages**
3. กดปุ่ม **"Create application"**
4. เลือกแท็บ **"Pages"** แล้วกด **"Connect to Git"**
5. อนุญาตและเลือก Repository `popular-vote` จาก GitHub แล้วกด **Begin setup**

### 3.2 ตั้งค่า Build Settings
ตั้งค่าในหน้าปรับแต่งโครงการดังนี้:
- **Project name**: `nwsp-popular-vote`
- **Production branch**: `main`
- **Framework preset**: เลือก **`Next.js (Static HTML Export)`**
- **Build command**: `npm run build`
- **Build output directory**: `out`

### 3.3 ใส่ค่า Environment Variables ใน Cloudflare Pages
ในหน้าเดียวกัน เลื่อนลงมาที่หัวข้อ **Environment variables (advanced)** กดปุ่ม **Add variable** เพื่อเพิ่มค่าทั้ง 6 ตัวจาก Firebase:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3.4 บันทึกและรัน Deploy
1. กดปุ่ม **"Save and Deploy"**
2. รอ Cloudflare ดึงโค้ดและทำการ Build ประมาณ 1-2 นาที
3. เมื่อขึ้นเครื่องหมายถูกสีเขียว ✨ ระบบจะให้ลิงก์เว็บใช้งานจริง เช่น `https://nwsp-popular-vote.pages.dev` ที่สามารถเปิดให้นักเรียนเข้าโหวตได้จากทุกที่ทันทีครับ!
