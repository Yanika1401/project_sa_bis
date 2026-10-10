import { useEffect, useState } from 'react';

export default function TraineeDashboard() {
  const [data, setData] = useState({ roadmap: [], assignments: [] });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(`http://localhost:5000/api/trainee/dashboard/${user?.profileId}`)
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>แดชบอร์ดผู้เข้ารับการฝึกอบรม (Trainee)</h1>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '14px' }}>แผนการเรียนรู้หลัก</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>{data.roadmap?.Title || 'Onboarding Program'}</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '14px' }}>งานที่ต้องส่ง</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{data.assignments?.length || 0} รายการ</p>
        </div>
      </div>
    </div>
  );
}