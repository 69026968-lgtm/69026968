# Library.Lend

เว็บยืม-คืนหนังสือ ธีมขาว-ดำ (HTML / CSS / JavaScript ล้วน ไม่ต้องติดตั้งอะไร) ข้อมูลเก็บใน localStorage ของเบราว์เซอร์

## โครงสร้าง
```
index.html        หน้าเดียว สลับหน้าด้วย #hash (#home #search #borrowed #history #reserved #contact #login #register)
css/style.css     สไตล์ทั้งหมด
js/common.js      ข้อมูลหนังสือ ตัวช่วย และ poka-yoke (guard, digits)
js/pages.js       ปุ่มยืม/คืน/จอง และเนื้อหาแต่ละหน้า
js/router.js      ตัวสลับหน้า
```

## ทฤษฎีที่ใช้
| ทฤษฎี | อยู่ตรงไหน |
|---|---|
| Golden ratio 1.618 | css/style.css : ตัวอักษร 16/26/42, ระยะห่าง 8-13-21-34-55, `.auth` 1fr:1.618fr, `.contact` 1.618fr:1fr, `.cover` aspect-ratio 1.618 |
| 9 ช่อง (ตำแหน่ง) | nav แบ่ง 3 ส่วน, `.stats` 3 ช่อง, `.grid` 3x3 (หนังสือ 9 เล่ม) |
| Poka-yoke | js/common.js `guard()` ปุ่มกดไม่ได้จนกรอกถูก, `digits()` พิมพ์ได้เฉพาะตัวเลข ; js/pages.js จำกัดยืม 3 เล่ม, บล็อกยืมเมื่อมีค่าปรับ, กันยืมซ้ำ, confirm ก่อนลบ |

## วิธีรัน

### 1) VS Code (ในเครื่อง)
1. แตก zip ก่อน
2. VS Code > File > Open Folder > เลือกโฟลเดอร์ Library.Lend
3. ติดตั้งส่วนขยาย Live Server แล้วคลิกขวา index.html > Open with Live Server (หรือดับเบิลคลิก index.html ก็ได้)

### 2) StackBlitz (บนคลาวด์)
1. เข้า stackblitz.com > สร้างโปรเจกต์แบบ HTML / JavaScript ที่ไม่ใช้เฟรมเวิร์ก
2. ลบไฟล์ตัวอย่าง แล้วลากไฟล์ใน Library.Lend เข้าไปให้ครบ (คงโฟลเดอร์ css และ js)
3. หน้า Preview จะแสดงเว็บทันที

### 3) GitHub + GitHub Pages (repository + static web server)
1. สร้าง repository ใหม่ (Public) ชื่อ library-lend
2. Add file > Upload files แล้วลากไฟล์ทั้งหมดขึ้นไป (index.html ต้องอยู่ชั้นนอกสุด) > Commit changes
3. Settings > Pages > Source: Deploy from a branch > Branch: main, โฟลเดอร์ / (root) > Save
4. รอประมาณ 1-2 นาที จะได้ลิงก์ https://ชื่อผู้ใช้.github.io/library-lend/

## หมายเหตุ
- ข้อมูลสมาชิกและรายการยืมเก็บในเบราว์เซอร์ของแต่ละเครื่อง ไม่ใช่เซิร์ฟเวอร์กลาง
- ทดลองได้โดยสมัครสมาชิกก่อน แล้วเข้าสู่ระบบ
