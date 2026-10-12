import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import AccountAvatar from '../components/AccountAvatar';

export default function Accounts() {
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirming, setConfirming] = useState(null); // account being confirmed for delete
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  function load() {
    setLoading(true);
    api
      .get('/admin/accounts', { params: { search, page, limit: 20 } })
      .then(({ data }) => {
        setAccounts(data.accounts);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch(() => toast.error('Could not load accounts.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  async function handleDelete() {
    if (!confirming) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/accounts/${confirming._id}`);
      toast.success(`Deleted "${confirming.name}".`);
      setConfirming(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete this account.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Accounts</h1>
      <p className="text-ink-700/60 text-sm mb-6">{total} gallery{total === 1 ? '' : 'ies'} total.</p>

      <div className="relative mb-6 max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name…"
          className="w-full rounded-full border border-banana-300 bg-white pl-11 pr-4 py-2.5 text-ink-900 placeholder:text-ink-700/50 focus-ring"
        />
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-banana-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-banana-100 text-left text-ink-900/70 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-bold"></th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Visibility</th>
              <th className="px-4 py-3 font-bold">Pictures</th>
              <th className="px-4 py-3 font-bold">Created</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-banana-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-700/50">
                  Loading…
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-700/50">
                  No accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc._id} className="hover:bg-banana-50 transition">
                  <td className="pl-4 py-3">
                    <AccountAvatar url={acc.avatarUrl} size={32} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{acc.name}</td>
                  <td className="px-4 py-3">
                    {acc.isPrivate ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-900 bg-banana-200 px-2.5 py-1 rounded-full">🔒 Private</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-leaf-600 bg-leaf-500/10 px-2.5 py-1 rounded-full">🌐 Public</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-700/80">{acc.pictureCount}</td>
                  <td className="px-4 py-3 text-ink-700/60">{new Date(acc.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setConfirming(acc)}
                      className="text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-full border border-red-200 hover:border-red-600 transition focus-ring"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full text-sm font-bold bg-banana-200 disabled:opacity-40 hover:bg-banana-300 transition focus-ring"
          >
            ← Prev
          </button>
          <span className="text-sm font-semibold text-ink-900/70">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full text-sm font-bold bg-banana-200 disabled:opacity-40 hover:bg-banana-300 transition focus-ring"
          >
            Next →
          </button>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl card-shadow p-6 max-w-sm w-full animate-fade-rise">
            <p className="text-3xl mb-2">⚠️</p>
            <h2 className="font-display text-lg font-bold text-ink-900">Delete "{confirming.name}"?</h2>
            <p className="text-sm text-ink-700/70 mt-1">
              This permanently deletes the gallery and all {confirming.pictureCount} of its pictures from Cloudinary. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirming(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-banana-100 hover:bg-banana-200 text-ink-900 font-bold text-sm transition focus-ring"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-60 focus-ring"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
