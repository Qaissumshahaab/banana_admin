import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function StatCard({ icon, label, value, to }) {
  const content = (
    <div className="bg-white rounded-2xl card-shadow border border-banana-200 p-5 flex items-center gap-4 hover:border-banana-400 transition">
      <div className="w-12 h-12 rounded-xl bg-banana-200 flex items-center justify-center text-2xl shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-display font-bold text-ink-900">{value ?? '—'}</p>
        <p className="text-sm text-ink-700/60">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const [accountsTotal, setAccountsTotal] = useState(null);
  const [slides, setSlides] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get('/admin/accounts', { params: { limit: 1 } }), api.get('/slider')]).then(
      ([accRes, slideRes]) => {
        if (accRes.status === 'fulfilled') setAccountsTotal(accRes.value.data.total);
        if (slideRes.status === 'fulfilled') setSlides(slideRes.value.data.length);
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Dashboard</h1>
      <p className="text-ink-700/60 text-sm mb-8">An overview of the KELA.com community.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <StatCard icon="👥" label="Total galleries" value={loading ? '…' : accountsTotal} to="/accounts" />
        <StatCard icon="🖼️" label="Slider images" value={loading ? '…' : slides} to="/slider" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/accounts"
          className="rounded-2xl p-5 bg-banana-500 text-ink-900 card-shadow hover:bg-banana-400 transition"
        >
          <p className="text-2xl mb-2">👥</p>
          <p className="font-display font-bold text-lg">Manage accounts</p>
          <p className="text-sm text-ink-900/70 mt-1">Search and remove galleries.</p>
        </Link>
        <Link
          to="/slider"
          className="rounded-2xl p-5 bg-white border border-banana-200 card-shadow hover:border-banana-400 transition"
        >
          <p className="text-2xl mb-2">🖼️</p>
          <p className="font-display font-bold text-lg">Manage slider</p>
          <p className="text-sm text-ink-700/70 mt-1">Add, edit, reorder & remove homepage slides.</p>
        </Link>
      </div>
    </div>
  );
}
