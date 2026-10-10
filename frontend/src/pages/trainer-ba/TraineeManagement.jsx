import { useEffect, useState } from 'react';

export default function TraineeManagement() {
  const [trainees, setTrainees] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/trainer/trainees')
      .then(res => res.json())
      .then(data => setTrainees(data));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>จัดการพนักงานใหม่ (Trainee Management)</h1>
      <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>รหัส</th>
            <th style={{ padding: '12px' }}>ชื่อ-นามสกุล</th>
            <th style={{ padding: '12px' }}>ตำแหน่ง</th>
            <th style={{ padding: '12px' }}>วันที่เริ่มงาน</th>
            <th style={{ padding: '12px' }}>ระดับทักษะ</th>
          </tr>
        </thead>
        <tbody>
          {trainees.map(t => (
            <tr key={t.Trainee_ID} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{t.Trainee_ID}</td>
              <td style={{ padding: '12px' }}>{t.Name}</td>
              <td style={{ padding: '12px' }}>{t.Position}</td>
              <td style={{ padding: '12px' }}>{t.Start_Date}</td>
              <td style={{ padding: '12px' }}>{t.Skill_Level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}