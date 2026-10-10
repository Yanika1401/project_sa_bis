import { useEffect, useState } from 'react';

const MAX_SCORE = 4.0;
const PASS_SCORE = 2.0;

const avg = (rows, key) => {
  const nums = rows.map((r) => Number(r[key])).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const fmt = (n) => (n === null ? '-' : Number(n).toFixed(2));
const show = (v) => (v === null || v === undefined ? '-' : Number(v));

const isPassed = (status) => String(status).toLowerCase() === 'passed';

function SummaryCard({ title, value }) {
  return (
    <div style={{ flex: 1, backgroundColor: '#fef6e4', borderRadius: '16px', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'bold', marginBottom: '12px' }}>{title}</div>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px' }}>
        <div style={{ fontSize: '34px', fontWeight: '800', color: '#111827' }}>{fmt(value)}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          จาก {MAX_SCORE.toFixed(2)} · เกณฑ์ผ่านไม่ต่ำกว่า {PASS_SCORE.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const ok = isPassed(status);
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: ok ? '#d1fae5' : '#fee2e2',
      color: ok ? '#047857' : '#dc2626'
    }}>
      {ok ? 'ผ่านแล้ว' : 'ต้องแก้ไข'}
    </span>
  );
}

const th = { textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' };
const td = { padding: '16px', fontSize: '14px', borderTop: '1px solid #e5e7eb' };

export default function MyEvaluation() {
  const [evaluations, setEvaluations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const profileId = user?.profileId;

  useEffect(() => {
    if (!profileId) return;
    fetch(`/api/trainee/evaluations/${profileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(data?.message || 'โหลดข้อมูลไม่สำเร็จ');
          return;
        }
        setEvaluations(data);
        setSelected(data.find((d) => d.Feedback_Note) || null);
      })
      .catch(() => setError('เชื่อมต่อ server ไม่ได้'));
  }, [profileId]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 20px' }}>ผลประเมินของฉัน</h1>

      {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <SummaryCard title="Dev Skill (เฉลี่ย)" value={avg(evaluations, 'Development_Score')} />
        <SummaryCard title="Business Logic (เฉลี่ย)" value={avg(evaluations, 'BusinessLogic_Score')} />
        <SummaryCard title="Communication (เฉลี่ย)" value={avg(evaluations, 'Communication_Score')} />
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>โจทย์</th>
              <th style={th}>Dev Skill</th>
              <th style={th}>Business Logic</th>
              <th style={th}>Communication</th>
              <th style={th}>ผล</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 && (
              <tr><td colSpan="6" style={{ ...td, textAlign: 'center', color: '#6b7280' }}>ยังไม่มีผลการประเมิน</td></tr>
            )}
            {evaluations.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...td, fontWeight: 'bold' }}>{item.Title}</td>
                <td style={td}>{show(item.Development_Score)}</td>
                <td style={td}>{show(item.BusinessLogic_Score)}</td>
                <td style={td}>{show(item.Communication_Score)}</td>
                <td style={td}><StatusBadge status={item.Status} /></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button
                    onClick={() => setSelected(item)}
                    style={{
                      padding: '7px 14px',
                      backgroundColor: '#fff',
                      border: '2px solid #1f2937',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    ดู Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: '800' }}>
          {selected ? `Feedback: ${selected.Title}` : 'Feedback ล่าสุด'}
        </h3>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
          {selected?.Feedback_Note || 'ยังไม่มีคำติชม'}
        </div>
        {selected?.Trainer_Name && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>พี่{selected.Trainer_Name}</div>
        )}
      </div>
    </div>
  );
}