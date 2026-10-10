import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://shiny-space-robot-pj6459jj5vqqc6p4x-5000.app.github.dev/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // บันทึก Token และข้อมูลผู้ใช้ลง LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // นำทางไปยัง Dashboard ตาม บทบาท (Role)
      const role = data.user.role;
      if (role === 'Trainee') navigate('/trainee/dashboard');
      else if (role === 'Trainer') navigate('/trainer/dashboard');
      else if (role === 'HR') navigate('/hr/dashboard');
      else navigate('/');

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f6' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '360px' }}>
        <h1 style={{ textAlign: 'center', color: '#f96302', margin: '0 0 8px 0' }}>TRAIN</h1>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '24px' }}>ยินดีต้อนรับเข้าสู่ระบบฝึกอบรม</p>

        {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>รหัสพนักงาน / Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '12px', backgroundColor: '#f96302', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}