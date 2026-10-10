
export default function TaskRepository() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>คลังโจทย์และสื่อการเรียนรู้ (Task Repository)</h1>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
        <button style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>
          + เพิ่มโจทย์ใหม่
        </button>
        <p style={{ color: '#6b7280' }}>รายการโจทย์และวิดีโอสื่อการเรียนรู้มาตรฐานทั้งหมดในระบบ...</p>
      </div>
    </div>
  );
}