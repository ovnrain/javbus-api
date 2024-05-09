import { redirect } from 'next/navigation';
import { deleteSession } from '../lib/session';

export async function GET() {
  await deleteSession();

  redirect('/');
}
