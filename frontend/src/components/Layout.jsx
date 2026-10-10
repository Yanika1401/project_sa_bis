import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar user={user} />
      <main className="app-main">{children}</main>
    </div>
  );
}