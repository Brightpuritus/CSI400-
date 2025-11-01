# ระบบจัดการโรงงานปลากระป๋อง (Vite Version)

โปรเจคนี้เป็นเวอร์ชัน Vite + JSX + CSS ของระบบจัดการโรงงานปลากระป๋อง

## การติดตั้ง

1. ดาวน์โหลดโปรเจค
2. เปิด Terminal ในโฟลเดอร์ `vite-app`
3. รันคำสั่ง:

\`\`\`bash
npm install
\`\`\`

## การรันโปรเจค

\`\`\`bash
npm run dev
\`\`\`

โปรเจคจะรันที่ `http://localhost:3000`

## การ Build

\`\`\`bash
npm run build
\`\`\`

## บัญชีทดสอบ

- **ลูกค้า**: customer@test.com / 123456
- **พนักงาน**: employee@test.com / 123456
- **ผู้จัดการ**: manager@test.com / 123456
- **ผู้ดูแลระบบ**: admin@test.com / 123456

## โครงสร้างโปรเจค

\`\`\`
vite-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── components/
    │   ├── Navbar.jsx
    │   └── Navbar.css
    ├── pages/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── CustomerOrders.jsx
    │   ├── NewOrder.jsx
    │   ├── Production.jsx
    │   ├── Delivery.jsx
    │   ├── Dashboard.jsx
    │   └── Users.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   └── DataStore.jsx
    └── styles/
        └── global.css
\`\`\`

## คุณสมบัติ

1. ✅ ระบบ Login/Register
2. ✅ จัดการคำสั่งซื้อ (ลูกค้า)
3. ✅ วางแผนและติดตามการผลิต (พนักงาน)
4. ✅ จัดการการจัดส่ง (พนักงาน)
5. ✅ รายงานยอดขายและภาษี (ผู้จัดการ)
6. ✅ จัดการผู้ใช้งาน (ผู้จัดการ)
7. ✅ Admin มีสิทธิ์เข้าถึงทุกอย่าง

## เทคโนโลยีที่ใช้

- React 18
- Vite
- React Router DOM
- Recharts (สำหรับกราฟ)
- Lucide React (สำหรับไอคอน)
- Pure CSS (ไม่ใช้ Tailwind)
