import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, BR_PASS, card, fmtDateTime, fmtScore, getUser, h1, StatCard, td, th } from '../../components/ui';

// เฉลี่ยเฉพาะรายการที่ตรวจแล้ว (ข้ามรายการที่ยังรอตรวจ)
const avg = (rows, key) => {
  const nums = rows.filter((r) => r.Evaluation_ID).map((r) => Number(r[key]));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

function SummaryCard({ title, value }) {
  const has = value !== null;
  const ok = has && value >= BR_PASS;
  return (
    <StatCard title={title}>
      <div style={{ fontSize: '34px', fontWeight: '800', color: !has ? '#9ca3af' : ok ? '#111827' : '#dc2626' }}>{fmtScore(value)}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        จาก 4.00 · เกณฑ์ผ่านไม่ต่ำกว่า {BR_PASS.toFixed(2)}
      </div>
    </StatCard>
  );
}

export default function MyEvaluation() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const profileId = getUser()?.profileId;

  useEffect(() => {
    if (!profileId) return;
    fetch(`/api/trainee/evaluations/${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return setError(data?.message || 'โหลดข้อมูลไม่สำเร็จ');
        setRows(data);
        setSelected(data.find((d) => d.Feedback_Note) || null);
      })
      .catch(() => setError('เชื่อมต่อ server ไม่ได้'));
  }, [profileId]);

  const evaluated = rows.filter((r) => r.Evaluation_ID).length;

  return (
    <div>
      <h1 style={h1}>ผลประเมินของฉัน</h1>
      {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <SummaryCard title="Dev Skill (เฉลี่ย)" value={avg(rows, 'Development_Score')} />
        <SummaryCard title="Business Logic (เฉลี่ย)" value={avg(rows, 'BusinessLogic_Score')} />
        <SummaryCard title="Communication (เฉลี่ย)" value={avg(rows, 'Communication_Score')} />
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        คำนวณจาก {evaluated} การประเมิน · รอตรวจ {rows.length - evaluated} รายการ
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>โจทย์</th>
              <th style={th}>ครั้งที่</th>
              <th style={th}>ส่งเมื่อ</th>
              <th style={th}>Dev</th>
              <th style={th}>Business</th>
              <th style={th}>Comm</th>
              <th style={th}>ผล</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="8" style={{ ...td, textAlign: 'center', color: '#6b7280' }}>ยังไม่มีการส่งงาน</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.Submission_ID}>
                <td style={{ ...td, fontWeight: 'bold' }}>{r.Title}</td>
                <td style={td}>{r.Version_No}</td>
                <td style={td}>{fmtDateTime(r.Submitted_At)}</td>
                <td style={td}>{r.Evaluation_ID ? r.Development_Score : '-'}</td>
                <td style={td}>{r.Evaluation_ID ? r.BusinessLogic_Score : '-'}</td>
                <td style={td}>{r.Evaluation_ID ? r.Communication_Score : '-'}</td>
                <td style={td}><Badge kind={r.Status || 'Waiting'} /></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {r.Evaluation_ID && (
                    <button
                      onClick={() => setSelected(r)}
                      style={{ padding: '7px 14px', backgroundColor: '#fff', border: '2px solid #1f2937', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ดู Feedback
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: '800' }}>
          {selected ? `Feedback: ${selected.Title} (ครั้งที่ ${selected.Version_No})` : 'Feedback'}
        </h3>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
          {selected?.Feedback_Note || 'ยังไม่มีคำติชม'}
        </div>
        {selected?.Trainer_Name && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            โดย {selected.Trainer_Name} · {fmtDateTime(selected.Feedback_At)}
          </div>
        )}
        {selected?.Status === 'Need_Revision' && (
          <div style={{ marginTop: '12px' }}>
            <Link to="/trainee/assignments" style={{ fontWeight: 'bold', color: '#dc2626' }}>ไปส่งงานแก้ไขใหม่ →</Link>
          </div>
        )}
      </div>
    </div>
  );
}