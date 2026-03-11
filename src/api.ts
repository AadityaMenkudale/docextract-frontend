const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function uploadDocument(file: File, docType?: string, expectedFields?: string[]) {
  const form = new FormData();
  form.append('file', file);
  if (docType) form.append('doc_type', docType);
  if (expectedFields) form.append('expected_fields', JSON.stringify(expectedFields));
  const res = await fetch(`${BASE_URL}/api/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
  return res.json();
}

export async function listDocuments(params?: { page?: number; per_page?: number; status?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.per_page) q.set('per_page', String(params.per_page));
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  const res = await fetch(`${BASE_URL}/api/documents?${q}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id: string) {
  const res = await fetch(`${BASE_URL}/api/documents/${id}`);
  if (!res.ok) throw new Error('Document not found');
  return res.json();
}

export async function reExtract(id: string) {
  const res = await fetch(`${BASE_URL}/api/documents/${id}/extract`, { method: 'POST' });
  if (!res.ok) throw new Error('Re-extraction failed');
  return res.json();
}

export async function approveDocument(id: string) {
  const res = await fetch(`${BASE_URL}/api/documents/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Approve failed');
  return res.json();
}

export async function updateFields(id: string, fields: { id: string; value: string }[]) {
  const res = await fetch(`${BASE_URL}/api/documents/${id}/fields`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${BASE_URL}/api/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export function getFileUrl(id: string) {
  return `${BASE_URL}/api/documents/${id}/file`;
}

export function getExportUrl(id: string, format: 'json' | 'csv' = 'json') {
  return `${BASE_URL}/api/documents/${id}/export?format=${format}`;
}