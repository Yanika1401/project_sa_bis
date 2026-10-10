import { useEffect, useState } from 'react';

const EMPTY_FORM = { username: '', password: '', name: '', role: 'Trainee' };

const th = { textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: '#6b7280', fontWeight: 'bold' };
const td = { padding: '16px', fontSize: '14px', borderTop: '1px solid #e5e7eb' };
const label = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' };
const input = {
  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
  boxSizing: 'border-box', fontSize: '14px'
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = () =>
    fetch('/api/hr/users')
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(data?.message || 'โหลดข้อมูลไม่สำเร็จ');
          return;
        }
        setError('');
        setUsers(data);
      })
      .catch(() => setError('เชื่อมต่อ server ไม่ได้'));

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setMode('add');
  };

  const openEdit = (u) => {
    setForm({ username: u.Username, password: '', name: u.Name || '', role: u.Role });
    setEditingId(u.User_ID);
    setFormError('');
    setMode('edit');
  };

  const closeModal = () => setMode(null);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) return setFormError('กรุณากรอกชื่อ');
    if (mode === 'add' && (!form.username.trim() || !form.password)) {
      return setFormError('กรุณากรอก Username และรหัสผ่าน');
    }

    setSaving(true);
    try {
      const url = mode === 'add' ? '/api/hr/users' : `/api/hr/users/${editingId}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'บันทึกไม่สำเร็จ');

      closeModal();
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>จัดการผู้ใช้</h1>
        <button
          onClick={openAdd}
          style={{
            backgroundColor: '#f59e0b', color: '#1f2937', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'
          }}
        >
          + เพิ่มผู้ใช้
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>}

      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>User ID</th>
              <th style={th}>Username</th>
              <th style={th}>ชื่อ-นามสกุล</th>
              <th style={th}>บทบาท (Role)</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ ...td, textAlign: 'center', color: '#6b7280' }}>ยังไม่มีผู้ใช้</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.User_ID}>
                <td style={td}>{u.User_ID}</td>
                <td style={td}>{u.Username}</td>
                <td style={td}>{u.Name || '-'}</td>
                <td style={{ ...td, fontWeight: 'bold', color: '#f97316' }}>{u.Role}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button
                    onClick={() => openEdit(u)}
                    style={{
                      padding: '7px 16px', backgroundColor: '#fff', border: '2px solid #1f2937',
                      borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
          }}
          onClick={closeModal}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90vw' }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '800' }}>
              {mode === 'add' ? 'เพิ่มผู้ใช้' : 'แก้ไขผู้ใช้'}
            </h2>

            {formError && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{formError}</div>}

            <div style={{ marginBottom: '14px' }}>
              <label style={label}>ชื่อ-นามสกุล</label>
              <input style={input} value={form.name} onChange={setField('name')} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={label}>Username</label>
              <input
                style={{ ...input, backgroundColor: mode === 'edit' ? '#f3f4f6' : '#fff' }}
                value={form.username}
                onChange={setField('username')}
                disabled={mode === 'edit'}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={label}>
                รหัสผ่าน{mode === 'edit' && ' (เว้นว่างถ้าไม่เปลี่ยน)'}
              </label>
              <input type="password" style={input} value={form.password} onChange={setField('password')} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={label}>บทบาท (Role)</label>
              <select
                style={{ ...input, backgroundColor: mode === 'edit' ? '#f3f4f6' : '#fff' }}
                value={form.role}
                onChange={setField('role')}
                disabled={mode === 'edit'}
              >
                <option value="Trainee">Trainee</option>
                <option value="Trainer">Trainer</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '9px 16px', backgroundColor: '#fff', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '9px 18px', backgroundColor: '#f59e0b', border: 'none',
                  borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'default' : 'pointer'
                }}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}