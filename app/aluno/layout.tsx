import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
import { StudentNavbar } from '../../components/navigation/student-navbar';
export default async function StudentLayout({children}:{children:React.ReactNode}){const user=await getSessionUser();if(!user)redirect('/login');if(user.role!=='STUDENT')redirect('/admin');return <div className="min-h-screen bg-slate-50"><StudentNavbar />{children}</div>}
