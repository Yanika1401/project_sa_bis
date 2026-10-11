import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge, card, fmtDateTime, getUser, h1 } from '../../components/ui';

const chip = { fontSize: '12px', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '999px', color: '#374151' };
const input = { flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' };

// แสดงสื่อในหน้าเดียวกัน: YouTube / ไฟล์วิดีโอ / อื่นๆ เป็นลิงก์เปิด
function MaterialViewer({ url, type }) {
  const [failed, setFailed] = useState(false);
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return (
      <iframe
        title="video" src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen
        style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: '8px' }}
      />
    );
  }
  if (!failed && /\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video src={url} controls onError={() => setFailed(true)} style={{ width: '100%', maxHeight: '360px', borderRadius: '8px', backgroundColor: '#000' }} />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#f97316' }}>
      เปิด{type === 'Video' ? 'วิดีโอ' : 'เอกสาร'} ↗
    </a>
  );
}

export default function Assignments() {
  const user = getUser();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState({});
  const [drafts, setDrafts] = useState({});
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);

  const load = () =>
    fetch(`/api/trainee/assignments/${user.profileId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setError(d.message);
        setData(d);
        // เปิดบทที่กำลังทำอยู่ (หรือบทที่เลือกมาจากหน้า Roadmap) ไว้ก่อน
        setOpen((prev) => {
          if (Object.keys(prev).length) return prev;
          const target = location.state?.openItem
            ? d.items.find((i) => i.Item_ID === location.state.openItem)
            : d.items.find((i) => i.Unlocked && i.ItemStatus !== 'Completed');
          return target ? { [target.Item_ID]: true } : {};
        });
      })
      .catch(() => setError('เชื่อมต่อ server ไม่ได้'));

  useEffect(() => {
    if (user?.profileId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urlsOf = (id) => drafts[id] || [''];
  const setUrl = (id, idx, val) => setDrafts({ ...drafts, [id]: urlsOf(id).map((u, i) => (i === idx ? val : u)) });
  const addUrl = (id) => setDrafts({ ...drafts, [id]: [...urlsOf(id), ''] });
  const removeUrl = (id, idx) => setDrafts({ ...drafts, [id]: urlsOf(id).filter((_, i) => i !== idx) });

  const handleSubmit = async (item) => {
    const urls = urlsOf(item.Assignment_ID).map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return setNotice({ ok: false, text: 'กรุณากรอกลิงก์ผลงานอย่างน้อย 1 รายการ' });
    if (urls.some((u) => !/^https?:\/\/\S+$/i.test(u))) {
      return setNotice({ ok: false, text: 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://' });
    }
    setSending(true);
    try {
      const res = await fetch('/api/trainee/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: user.profileId,
          assignmentId: item.Assignment_ID,
          files: urls.map((url) => ({ url }))
        })
      });
      const d = await res.json();
      setNotice({ ok: res.ok, text: d.message });
      if (res.ok) {
        setDrafts({ ...drafts, [item.Assignment_ID]: [''] });
        load();
      }
    } catch {
      setNotice({ ok: false, text: 'เชื่อมต่อ server ไม่ได้' });
    } finally {
      setSending(false);
    }
  };

  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>;
  if (!data) return <div style={{ color: '#6b7280' }}>กำลังโหลด...</div>;
  if (!data.roadmap) {
    return (
      <div>
        <h1 style={h1}>สื่อการเรียนรู้และแบบฝึกหัด</h1>
        <div style={{ ...card, color: '#6b7280' }}>ยังไม่มีแผนการฝึกอบรมสำหรับผู้ใช้งาน</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={h1}>สื่อการเรียนรู้และแบบฝึกหัด</h1>

      {notice && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold',
          backgroundColor: notice.ok ? '#d1fae5' : '#fee2e2', color: notice.ok ? '#047857' : '#dc2626'
        }}>
          {notice.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.items.map((item) => {
          const isOpen = !!open[item.Item_ID];
          const kind = !item.Unlocked ? 'Locked' : item.blockReason === 'WAITING' ? 'Waiting' : item.submitMode === 'resubmit' ? 'Need_Revision' : item.ItemStatus;
          const id = item.Assignment_ID;

          return (
            <div key={item.Item_ID} style={{ ...card, opacity: item.Unlocked ? 1 : 0.65 }}>
              <div
                onClick={() => item.Unlocked && setOpen({ ...open, [item.Item_ID]: !isOpen })}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', cursor: item.Unlocked ? 'pointer' : 'default' }}
              >
                <div>
                  <div style={{ fontWeight: '800', fontSize: '17px' }}>บทที่ {item.Seq_No}: {item.Title}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={chip}>{item.Category === 'Development' ? 'Development' : 'Business Logic'}</span>
                    <span style={chip}>{item.Difficulty_Level}</span>
                    <span style={{ ...chip, color: '#dc2626' }}>กำหนดส่ง {fmtDateTime(item.Deadline)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge kind={kind} />
                  {item.Unlocked && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>{isOpen ? '▲ ย่อ' : '▼ ดูรายละเอียด'}</div>}
                </div>
              </div>

              {!item.Unlocked && (
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                  ต้องเรียนและส่งงานบทที่ {item.Seq_No - 1} ให้ผ่านการประเมินก่อน จึงจะเข้าบทนี้ได้
                </div>
              )}

              {item.Unlocked && isOpen && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      📚 สื่อการเรียนรู้: {item.MaterialTitle} <span style={chip}>{item.MaterialType}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '10px' }}>{item.MaterialDescription || '-'}</div>
                    <MaterialViewer url={item.Material_URL} type={item.MaterialType} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📝 โจทย์</div>
                    <div style={{ fontSize: '14px', color: '#4b5563' }}>{item.Description || '-'}</div>
                  </div>

                  {item.submissions.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>ประวัติการส่งงาน</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[...item.submissions].reverse().map((s) => (
                          <div key={s.Submission_ID} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <strong>ครั้งที่ {s.Version_No}</strong>
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>ส่งเมื่อ {fmtDateTime(s.Submitted_At)}</span>
                              <Badge kind={s.EvalStatus || 'Waiting'} />
                            </div>
                            <div style={{ fontSize: '13px', margin: '6px 0' }}>
                              {s.Files.map((f, idx) => (
                                <div key={idx}>
                                  🔗 <a href={f.url} target="_blank" rel="noreferrer">{f.name || f.url}</a>
                                </div>
                              ))}
                            </div>
                            {s.EvalStatus && (
                              <div style={{ fontSize: '13px', color: '#374151' }}>
                                คะแนน: Dev {s.Development_Score} · Business {s.BusinessLogic_Score} · Comm {s.Communication_Score}
                                {s.Feedback_Note && <div style={{ marginTop: '4px' }}>💬 {s.Feedback_Note} {s.Trainer_Name && <em style={{ color: '#6b7280' }}>— {s.Trainer_Name}</em>}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.blockReason === 'WAITING' && (
                    <div style={{ padding: '12px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '8px', fontWeight: 'bold' }}>
                      งานของคุณอยู่ระหว่างรอ Trainer / BA ตรวจ
                    </div>
                  )}
                  {item.blockReason === 'COMPLETED' && (
                    <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '8px', fontWeight: 'bold' }}>
                      ✓ บทนี้ผ่านการประเมินแล้ว
                    </div>
                  )}

                  {item.submitMode && (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        {item.submitMode === 'resubmit' ? `ส่งงานแก้ไข (ครั้งที่ ${item.latest.Version_No + 1})` : 'ส่งงาน'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {urlsOf(id).map((u, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                            <input
                              style={input} value={u} placeholder="วางลิงก์ผลงาน (PDF / GitHub / Drive)"
                              onChange={(e) => setUrl(id, idx, e.target.value)}
                            />
                            {urlsOf(id).length > 1 && (
                              <button onClick={() => removeUrl(id, idx)} style={{ border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', padding: '0 12px' }}>
                                ลบ
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={() => addUrl(id)} style={{ border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', padding: '8px 14px', fontWeight: 'bold' }}>
                          + เพิ่มลิงก์
                        </button>
                        <button className="btn-primary" disabled={sending} onClick={() => handleSubmit(item)}>
                          {sending ? 'กำลังส่ง...' : item.submitMode === 'resubmit' ? 'ส่งงานแก้ไข' : 'ส่งงาน'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}