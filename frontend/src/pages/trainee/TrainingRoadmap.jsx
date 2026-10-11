import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, ProgressBar, card, fmtDate, getUser, h1 } from '../../components/ui';

const chip = { fontSize: '12px', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '999px', color: '#374151' };

export default function TrainingRoadmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user?.profileId) return;
    fetch(`/api/trainee/roadmap/${user.profileId}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.message) : setData(d)))
      .catch(() => setError('เชื่อมต่อ server ไม่ได้'));
  }, [user?.profileId]);

  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>;
  if (!data) return <div style={{ color: '#6b7280' }}>กำลังโหลด...</div>;

  const { roadmap, items } = data;
  if (!roadmap) {
    return (
      <div>
        <h1 style={h1}>เส้นทางการเรียนรู้ (Training Roadmap)</h1>
        <div style={{ ...card, color: '#6b7280' }}>ยังไม่มีแผนการฝึกอบรมสำหรับผู้ใช้งาน</div>
      </div>
    );
  }

  const done = items.filter((i) => i.ItemStatus === 'Completed').length;

  return (
    <div>
      <h1 style={h1}>เส้นทางการเรียนรู้ (Training Roadmap)</h1>

      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f97316' }}>{roadmap.Title}</div>
            <div style={{ color: '#4b5563', margin: '6px 0' }}>{roadmap.Description || '-'}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              ผู้ดูแล: {roadmap.Trainer_Name} · ระยะเวลา {fmtDate(roadmap.Start_Date)} – {fmtDate(roadmap.End_Date)}
            </div>
          </div>
          <Badge kind={roadmap.Status} />
        </div>
        <div style={{ marginTop: '14px', maxWidth: '420px' }}><ProgressBar done={done} total={items.length} /></div>
      </div>

      {items.length === 0 && <div style={{ ...card, color: '#6b7280' }}>แผนนี้ยังไม่มีบทเรียน</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((i) => {
          const locked = !i.Unlocked;
          const kind = locked ? 'Locked' : i.blockReason === 'WAITING' ? 'Waiting' : i.submitMode === 'resubmit' ? 'Need_Revision' : i.ItemStatus;
          return (
            <div key={i.Item_ID} style={{ ...card, display: 'flex', gap: '16px', alignItems: 'center', opacity: locked ? 0.6 : 1 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: '800', backgroundColor: i.ItemStatus === 'Completed' ? '#d1fae5' : '#fef3c7'
              }}>
                {i.ItemStatus === 'Completed' ? '✓' : i.Seq_No}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>บทที่ {i.Seq_No}: {i.Title}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '6px 0' }}>
                  <span style={chip}>{i.Category === 'Development' ? 'Development' : 'Business Logic'}</span>
                  <span style={chip}>{i.Difficulty_Level}</span>
                  <span style={chip}>สื่อ: {i.MaterialTitle}</span>
                  <span style={{ ...chip, color: '#dc2626' }}>กำหนดส่ง {fmtDate(i.Deadline)}</span>
                </div>
                {locked && <div style={{ fontSize: '13px', color: '#6b7280' }}>ต้องผ่านบทที่ {i.Seq_No - 1} ก่อนจึงจะเข้าบทนี้ได้</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge kind={kind} />
                {!locked && (
                  <div style={{ marginTop: '8px' }}>
                    <Link to="/trainee/assignments" state={{ openItem: i.Item_ID }} style={{ fontSize: '13px', fontWeight: 'bold', color: '#f97316' }}>
                      เปิดบทเรียน →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}