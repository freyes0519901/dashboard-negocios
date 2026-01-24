import { redirect } from 'next/navigation';

export async function POST(request) {
  redirect('/flow/return');
}

export async function GET(request) {
  redirect('/flow/return');
}
