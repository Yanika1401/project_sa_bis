import { useEffect, useState } from 'react';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch('http://localhost:5000/api/trainee/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data));
  }, []);

  const handleSubmit = (assignmentId) => {
    if (!fileUrl) return alert('กรุณากรอก URL ลิงก์งานที่ต้องการส่ง');

    fetch('http://localhost:5000/api/trainee/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traineeId: user.profileId, assignmentId, fileUrl })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      setFileUrl('');
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>งานที่ได้รับมอบหมาย (Assignments)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {assignments.map((item) => (
          <div key={item.Assignment_ID} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{item.Title}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{item.Description}</p>
            <p style={{ fontSize: '12px', color: '#dc2626' }}>กำหนดส่ง: {item.Deadline}</p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="วางลิงก์ผลงาน (PDF / GitHub / Drive)" 
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <button 
                onClick={() => handleSubmit(item.Assignment_ID)} 
                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                ส่งงาน
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}