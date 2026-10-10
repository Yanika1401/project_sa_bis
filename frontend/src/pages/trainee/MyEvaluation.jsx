import { useEffect, useState } from 'react';

export default function MyEvaluation() {
  const [evaluations, setEvaluations] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(`http://localhost:5000/api/trainee/evaluations/${user?.profileId}`)
      .then(res => res.json())
      .then(data => setEvaluations(data));
  }, [user]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>ผลการประเมินและ Feedback ของฉัน</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {evaluations.map((item, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>โจทย์: {item.Title}</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div>Dev Skill: <strong>{item.Development_Score || '-'} / 4.00</strong></div>
              <div>Business Logic: <strong>{item.BusinessLogic_Score || '-'} / 4.00</strong></div>
              <div>Communication: <strong>{item.Communication_Score || '-'} / 4.00</strong></div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <strong>Feedback จาก Trainer:</strong> {item.Feedback_Note || 'ยังไม่มีคำติชม'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}