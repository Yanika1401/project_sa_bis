import { useEffect, useState } from 'react';

export default function EvaluateTask() {
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({ devScore: 3, bizScore: 3, commScore: 3, feedbackNote: '', status: 'Passed' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch('http://localhost:5000/api/trainer/submissions')
      .then(res => res.json())
      .then(data => setSubmissions(data));
  }, []);

  const handleEvaluate = (submissionId) => {
    fetch('http://localhost:5000/api/trainer/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, trainerId: user.profileId, ...form })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.reload();
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>ตรวจและประเมินผลงาน (Evaluation)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {submissions.map(s => (
          <div key={s.Submission_ID} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>ผู้ส่ง: {s.TraineeName} | หัวข้อ: {s.AssignmentTitle}</h3>
            <p>ลิงก์งาน: <a href={s.File_URL} target="_blank" rel="noreferrer">{s.File_URL}</a></p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '15px 0' }}>
              <div>
                <label>Dev Score (1-4): </label>
                <input type="number" step="0.1" max="4" value={form.devScore} onChange={e => setForm({...form, devScore: e.target.value})} style={{ width: '100%', padding: '6px' }} />
              </div>
              <div>
                <label>Business Score (1-4): </label>
                <input type="number" step="0.1" max="4" value={form.bizScore} onChange={e => setForm({...form, bizScore: e.target.value})} style={{ width: '100%', padding: '6px' }} />
              </div>
              <div>
                <label>Comm Score (1-4): </label>
                <input type="number" step="0.1" max="4" value={form.commScore} onChange={e => setForm({...form, commScore: e.target.value})} style={{ width: '100%', padding: '6px' }} />
              </div>
            </div>

            <textarea 
              placeholder="กรอก Feedback ข้อเสนอแนะ" 
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              onChange={e => setForm({...form, feedbackNote: e.target.value})}
            />

            <button onClick={() => handleEvaluate(s.Submission_ID)} style={{ backgroundColor: '#f97316', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              บันทึกผลการประเมิน
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}