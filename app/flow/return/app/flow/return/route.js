import { redirect } from 'next/navigation';

export async function POST(request) {
  // Flow envía POST, redirigimos a la página con GET
  redirect('/flow/return');
}

export async function GET(request) {
  redirect('/flow/return');
}
