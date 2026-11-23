# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **ผู้เล่นและผู้ชมในเซิร์ฟเวอร์ (Players & Spectators):** เปิดดูอันดับคะแนนทีม, จำนวนเพชร, สถานะ Raid Day, และเควสเร่งด่วน (Flash Quest) พร้อมเวลานับถอยหลังแบบเรียลไทม์ระหว่างเล่นหรือรับชมสตรีม
- **แอดมินและผู้จัดกิจกรรม (Admins & Event Hosts):** ล็อกอินด้วย Admin Token (`x-admin-token`) เพื่อควบคุมสถานะเกม (Lobby/Active/Raid Day), ปรับคะแนนทีม, สั่งปล่อยหรือสุ่มเควสผ่าน Minecraft RCON หรือ Gemini AI Quest Director, และตรวจสอบ Audit Log

## Product Purpose

**NBs SMP Dashboard** คือเว็บแดชบอร์ดเรียลไทม์สำหรับแสดงผลคะแนนการแข่งขันและภารกิจของเซิร์ฟเวอร์เกม Minecraft (`NBs_Datapack`) ช่วยให้ผู้เล่นทุกคนติดตามสถานการณ์ล่าสุดของเซิร์ฟเวอร์ได้ทันทีจากเบราว์เซอร์ และช่วยให้แอดมินจัดการกิจกรรมได้โดยไม่ต้องพิมพ์คำสั่งยาวๆ ในเกมหรือคอนโซล

## Positioning

เชื่อมต่อกับ Minecraft Datapack โดยตรงผ่านโปรโตคอล **Binary TCP RCON** และกระจายสถานะให้ผู้ชมทุกหน้าจอแบบเรียลไทม์ผ่าน **Server-Sent Events (`/api/stream`)** โดยไม่จำเป็นต้องติดตั้ง Mod หรือ Plugin เพิ่มเติมฝั่งเซิร์ฟเวอร์ และมีโหมด **In-Memory Demo Fallback** ในตัวเมื่อฐานข้อมูล PostgreSQL หรือเซิร์ฟเวอร์เกมยังไม่พร้อมใช้งาน

## Operating Context

- **สภาพแวดล้อมการใช้งาน:** ผู้ใช้จำนวนมากเปิดหน้าเว็บทิ้งไว้บนจอที่สองหรือสลับหน้าต่างมาระหว่างเล่น Minecraft Java Edition (`26.3`) จึงต้องการหน้าจอที่อ่านตัวเลขได้ไว สบายตาในระยะยาว และไม่อัปเดตกระตุก
- **เทคโนโลยีหลัก:** Web application ใน `web/` พัฒนาด้วย **React 19 + TypeScript + Vite + Tailwind CSS v4** (ฝั่ง Client) และ **Bun + Elysia + Drizzle ORM + PostgreSQL** (ฝั่ง Server)
- **ภาษา:** ข้อความ UI และป้ายกำกับหลักเป็น **ภาษาไทย** ควบคู่กับชื่อไอเทมและคำศัพท์เทคนิคของ Minecraft เป็น **ภาษาอังกฤษ** (เช่น `Iron Block`, `Raid Day`, `Flash Quest`)

## Capabilities and Constraints

- **Live Scoreboard & Flash Quest:** แสดงผลคะแนน (`score`), เพชร (`diamonds`), และอันดับของทีมที่เปิดใช้งาน (รองรับสูงสุด 10 สีทีมใน `TEAM_COLOR_META`) พร้อมตัวจับเวลาถอยหลังของ Flash Quest และแหล่งที่มาของเควส (`AI`, `POOL`, `MANUAL`, `INGAME`)
- **History & Audit Trail:** แสดงประวัติเควสย้อนหลัง, จุดบันทึกคะแนน (`snapshots`), และบันทึกคำสั่งแอดมิน (`audits`)
- **RCON Safety Constraints:** คำสั่งทั้งหมดที่ส่งเข้า Minecraft ต้องผ่านการตรวจสิทธิ์ `x-admin-token`, กรองอักขระอันตราย (`sanitizeMcString`), และจำกัดไอเทมเควสให้อยู่ใน `MC_QUEST_WHITELIST`
- **Resilient Fallbacks:** เมื่อไม่มี RCON หรือ PostgreSQL ระบบต้องยังเปิดใช้งานในโหมด `demo` ได้โดยไม่พัง

## Product Principles

1. **Glanceable Precision:** ผู้เล่นที่เหลือบมองเพียง 1–2 วินาทีต้องเห็นอันดับทีม คะแนน และเวลาที่เหลือของ Flash Quest ได้ทันทีโดยไม่ต้องเพ่ง
2. **Flat & Uncluttered Hierarchy:** ลดการซ้อนกรอบหลายชั้น แยกสัดส่วนด้วยโครงสร้างที่ชัดเจนเพื่อให้ข้อมูลจริงเด่นกว่าตกแต่ง
3. **Zero-Friction Real-Time:** ข้อมูลคะแนนและเวลานับถอยหลังต้องอัปเดตลื่นไหลผ่าน SSE โดยตัวเลขไม่ขยับสั่นไปมา
4. **Safe Administrative Control:** การกระทำของแอดมินแยกส่วนจากมุมมองผู้เล่นชัดเจนและมี feedback ยืนยันผลทันที

## Accessibility & Inclusion

- **WCAG Contrast Compliance:** ข้อความเนื้อหาหลักต้องมี Contrast Ratio ไม่ต่ำกว่า **4.5:1 (WCAG AA)** และตัวเลขสำคัญ (คะแนนทีม, อันดับ, เวลานับถอยหลัง) ไม่ต่ำกว่า **7:1 (WCAG AAA)**
- **Color-Blind-Safe Data Visualization:** แถบคะแนนทีมห้ามพึ่งพาสีเพียงอย่างเดียวในการแยกแยะทีม — ต้องแสดงป้ายกำกับชื่อทีม/สัญลักษณ์ประจำทีม (หรือเลขอันดับ) และตัวเลขคะแนนกำกับชัดเจนเสมอ
- **Tabular Numerals:** ตัวเลขคะแนน เพชร และเวลานับถอยหลังทั้งหมดต้องใช้ `tabular-nums` เพื่อความสม่ำเสมอในการอ่านและจัดแนวคอลัมน์
