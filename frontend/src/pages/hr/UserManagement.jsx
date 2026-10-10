import { useEffect, useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/hr/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>จัดการบัญชีผู้ใช้งาน (User Management)</h1>
      <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>User ID</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>ชื่อ-นามสกุล</th>
            <th style={{ padding: '12px' }}>บทบาท (Role)</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.User_ID} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{u.User_ID}</td>
              <td style={{ padding: '12px' }}>{u.Username}</td>
              <td style={{ padding: '12px' }}>{u.Name}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#f97316' }}>{u.Role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}