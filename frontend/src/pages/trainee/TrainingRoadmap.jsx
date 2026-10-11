import { useEffect, useState } from 'react';

export default function TrainingRoadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(`/api/trainee/roadmap/${user?.profileId}`)
      .then(res => res.json())
      .then(data => setRoadmap(data));
  }, [user]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>เส้นทางการเรียนรู้ (Training Roadmap)</h1>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {roadmap.map((item, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
            <h3 style={{ color: '#f97316', margin: '0 0 5px 0' }}>{item.Title}</h3>
            <p style={{ color: '#4b5563', margin: '0 0 10px 0' }}>{item.Description}</p>
            <span style={{ fontSize: '12px', backgroundColor: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>
              ระยะเวลา: {item.StartDate} ถึง {item.EndDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}