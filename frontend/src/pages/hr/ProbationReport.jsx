import { useState } from 'react';

export default function ProbationReport() {
  const [form, setForm] = useState({ traineeId: 1, status: 'Passed', remark: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/hr/probation-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hrId: user.profileId })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>ออกรายงาน Probation Report</h1>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Trainee ID:</label>
          <input type="number" value={form.traineeId} onChange={e => setForm({...form, traineeId: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>ผลสรุปประเมิน:</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '8px' }}>
            <option value="Passed">Passed (ผ่านทดลองงาน)</option>
            <option value="Failed">Failed (ไม่ผ่าน)</option>
            <option value="Extended">Extended (ขยายเวลาทดลองงาน)</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>หมายเหตุ / ความเห็น HR:</label>
          <textarea value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          บันทึกและออกรายงาน
        </button>
      </form>
    </div>
  );
}