import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuConfig = {
    Trainee: [
      { label: 'แดชบอร์ด', path: '/trainee/dashboard' },
      { label: 'เส้นทางการเรียนรู้', path: '/trainee/roadmap' },
      { label: 'งานที่ได้รับมอบหมาย', path: '/trainee/assignments' },
      { label: 'ผลการประเมินของฉัน', path: '/trainee/evaluations' }
    ],
    Trainer: [
      { label: 'แดชบอร์ด', path: '/trainer/dashboard' },
      { label: 'จัดการ Trainee', path: '/trainer/trainees' },
      { label: 'ตรวจและประเมินงาน', path: '/trainer/evaluations' },
      { label: 'คลังโจทย์และสื่อ', path: '/trainer/tasks' }
    ],
    HR: [
      { label: 'แดชบอร์ด', path: '/hr/dashboard' },
      { label: 'จัดการบัญชีผู้ใช้', path: '/hr/users' },
      { label: 'รายงาน Probation', path: '/hr/probation' }
    ]
  };

  const currentMenu = menuConfig[user?.role] || [];

  return (
    <div style={{ width: '250px', backgroundColor: '#f97316', color: '#fff', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>TRAIN</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={index} to={item.path} style={{
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'transparent',
                fontWeight: isActive ? 'bold' : 'normal'
              }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' }}>
        <div style={{ fontSize: '13px', marginBottom: '10px' }}>
          ผู้ใช้งาน: <strong>{user?.fullName}</strong><br />
          ตำแหน่ง: <span style={{ textTransform: 'uppercase' }}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}