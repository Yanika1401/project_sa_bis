
export default function TrainerDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>แดชบอร์ดผู้ฝึกสอน (Trainer / BA)</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>จำนวน Trainee ที่ดูแล</h3>
          <p style={{ fontSize: '32px', color: '#f97316', fontWeight: 'bold' }}>5 คน</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>การบ้านรอการตรวจ</h3>
          <p style={{ fontSize: '32px', color: '#ef4444', fontWeight: 'bold' }}>2 รายการ</p>
        </div>
      </div>
    </div>
  );
}