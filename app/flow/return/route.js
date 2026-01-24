import { redirect } from 'next/navigation';

export async function POST(request) {
  const url = new URL(request.url);
  const pedido = url.searchParams.get('pedido') || '';
  redirect(`/flow?pedido=${pedido}`);
}

export async function GET(request) {
  const url = new URL(request.url);
  const pedido = url.searchParams.get('pedido') || '';
  redirect(`/flow?pedido=${pedido}`);
}
