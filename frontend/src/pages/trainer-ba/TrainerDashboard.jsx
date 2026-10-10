function StatCard({ title, value, unit, bg }) {
  return (
    <div style={{ flex: 1, backgroundColor: bg, borderRadius: '16px', padding: '18px 20px' }}>
      <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>{title}</div>
      <div style={{
        display: 'inline-block',
        minWidth: '70px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '12px 16px'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{unit}</div>
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 20px' }}>
        แดชบอร์ดผู้ฝึกสอน (Trainer / BA)
      </h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <StatCard title="จำนวน Trainee ที่ดูแล" value="5" unit="คน" bg="#fef6e4" />
        <StatCard title="การบ้านรอการตรวจ" value="2" unit="รายการ" bg="#f3f4f6" />
      </div>
    </div>
  );
}