
export default function HrDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>แดชบอร์ดฝ่ายทรัพยากรบุคคล (HR)</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>จำนวนผู้ใช้งานทั้งหมด</h3>
          <p style={{ fontSize: '32px', color: '#3b82f6', fontWeight: 'bold' }}>7 บัญชี</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>รายงาน Probation ที่ออกแล้ว</h3>
          <p style={{ fontSize: '32px', color: '#10b981', fontWeight: 'bold' }}>2 ฉบับ</p>
        </div>
      </div>
    </div>
  );
}