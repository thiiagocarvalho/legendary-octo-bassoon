import { prisma } from '../../../lib/db';
import { StudentMessages } from '../../../components/admin/student-messages';

export default async function MessagesPage(){const messages=await prisma.studentMessage.findMany({include:{student:{select:{fullName:true}}},orderBy:{createdAt:'desc'}});return <section><h1 className="text-3xl font-bold">Mensagens dos alunos</h1><StudentMessages messages={messages}/></section>}
