import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Slider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirming, setConfirming] = useState(null);
  const inputRef = useRef(null);
  const toast = useToast();

  function load() {
    setLoading(true);
    api
      .get('/slider')
      .then(({ data }) => setSlides(data))
      .catch(() => toast.error('Could not load slider images.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function pickFile(f) {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!file) return toast.error('Please choose an image.');

    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('order', slides.length);

    setSubmitting(true);
    try {
      await api.post('/admin/slider', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Slide added.');
      setFile(null);
      setPreview('');
      setTitle('');
      if (inputRef.current) inputRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add slide.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveTitle(id) {
    try {
      await api.put(`/admin/slider/${id}`, { title: editTitle.trim() });
      setEditingId(null);
      load();
    } catch {
      toast.error('Could not update title.');
    }
  }

  async function move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setSlides(reordered); // optimistic
    try {
      await Promise.all(reordered.map((s, i) => api.put(`/admin/slider/${s._id}`, { order: i })));
    } catch {
      toast.error('Could not save new order.');
      load();
    }
  }

  async function handleDelete() {
    if (!confirming) return;
    try {
      await api.delete(`/admin/slider/${confirming._id}`);
      toast.success('Slide removed.');
      setConfirming(null);
      load();
    } catch {
      toast.error('Could not remove slide.');
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Slider Images</h1>
      <p className="text-ink-700/60 text-sm mb-6">Manage the large slider shown at the top of the homepage.</p>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl card-shadow border border-banana-200 p-5 mb-8 space-y-4">
        <p className="font-display font-bold text-ink-900">Add a new slide</p>
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-banana-300 bg-banana-50 hover:bg-banana-100 cursor-pointer flex items-center gap-4 p-4 transition"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {preview ? (
            <img src={preview} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />
          ) : (
            <div className="w-20 h-14 rounded-lg bg-banana-200 flex items-center justify-center text-xl shrink-0">🖼️</div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm text-ink-900 truncate">{file ? file.name : 'Tap to choose an image'}</p>
            <p className="text-xs text-ink-700/60">Recommended: wide banner image, 1600×700 or similar</p>
          </div>
        </div>

        <div>
          <label htmlFor="slide-title" className="block text-sm font-bold text-ink-900 mb-1.5">
            Caption <span className="text-ink-700/50 font-normal">(optional)</span>
          </label>
          <input
            id="slide-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="e.g. Summer Trip 2026"
            className="w-full rounded-xl border border-banana-300 bg-white px-4 py-2.5 text-ink-900 placeholder:text-ink-700/50 focus-ring"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-banana-500 hover:bg-banana-400 text-ink-900 font-display font-bold transition active:scale-[0.99] disabled:opacity-60 focus-ring"
        >
          {submitting ? 'Adding…' : '+ Add slide'}
        </button>
      </form>

      {loading ? (
        <p className="text-ink-700/50 text-sm">Loading…</p>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-banana-300 bg-banana-100/50">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="font-display font-semibold text-ink-900">No slides yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={s._id} className="bg-white rounded-2xl card-shadow border border-banana-200 p-3 flex items-center gap-4">
              <img src={s.url} alt="" className="w-24 h-16 object-cover rounded-xl shrink-0" />

              <div className="flex-1 min-w-0">
                {editingId === s._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveTitle(s._id)}
                      className="flex-1 rounded-lg border border-banana-300 bg-white px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-700/50 focus-ring"
                    />
                    <button onClick={() => saveTitle(s._id)} className="text-xs font-bold text-leaf-600 hover:underline">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-xs font-bold text-ink-700/50 hover:underline">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(s._id);
                      setEditTitle(s.title || '');
                    }}
                    className="text-left"
                  >
                    <p className="font-semibold text-sm text-ink-900 truncate">{s.title || <span className="text-ink-700/40 italic">No caption — click to add</span>}</p>
                    <p className="text-xs text-ink-700/50">Position {i + 1}</p>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="w-8 h-8 rounded-full hover:bg-banana-100 disabled:opacity-30 transition focus-ring flex items-center justify-center"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label="Move down"
                  className="w-8 h-8 rounded-full hover:bg-banana-100 disabled:opacity-30 transition focus-ring flex items-center justify-center"
                >
                  ↓
                </button>
                <button
                  onClick={() => setConfirming(s)}
                  className="ml-2 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-full border border-red-200 hover:border-red-600 transition focus-ring"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl card-shadow p-6 max-w-sm w-full animate-fade-rise">
            <p className="text-3xl mb-2">⚠️</p>
            <h2 className="font-display text-lg font-bold text-ink-900">Remove this slide?</h2>
            <p className="text-sm text-ink-700/70 mt-1">This image will be removed from the homepage slider permanently.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2.5 rounded-xl bg-banana-100 hover:bg-banana-200 text-ink-900 font-bold text-sm transition focus-ring">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition focus-ring">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
