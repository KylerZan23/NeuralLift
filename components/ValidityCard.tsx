'use client';
export default function ValidityCard({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className={`rounded-2xl p-3 ${ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      {message}
    </div>
  );
}


