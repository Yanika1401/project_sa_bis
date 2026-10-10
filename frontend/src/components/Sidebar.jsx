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
    <div style={{
      width: '240px',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      minHeight: '100vh',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'sans-serif'
    }}>
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#f96302',
          margin: 0,
          padding: '24px 20px 20px'
        }}>
          TRAIN
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={index} to={item.path} style={{
                color: '#1f2937',
                textDecoration: 'none',
                padding: '14px 20px',
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                borderRight: isActive ? '4px solid #f59e0b' : '4px solid transparent'
              }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ fontSize: '13px', marginBottom: '10px', color: '#4b5563' }}>
          ผู้ใช้งาน: <strong style={{ color: '#1f2937' }}>{user?.fullName}</strong><br />
          ตำแหน่ง: <span style={{ textTransform: 'uppercase' }}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#ffffff',
          color: '#dc2626',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}