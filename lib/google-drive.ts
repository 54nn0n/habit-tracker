import { getValidToken } from './google-auth';

const FILES_API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const FILE_NAME = '93_Habits_Log.md';
const FILE_ID_KEY = 'gd_file_id';

async function headers(): Promise<Record<string, string>> {
  const token = await getValidToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

async function findFileId(): Promise<string | null> {
  const cached = localStorage.getItem(FILE_ID_KEY);
  if (cached) return cached;

  const h = await headers();
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await fetch(`${FILES_API}?q=${q}&fields=files(id)`, { headers: h });
  if (!res.ok) throw new Error(`Drive search failed: ${res.status}`);

  const { files } = await res.json();
  if (files.length > 0) {
    localStorage.setItem(FILE_ID_KEY, files[0].id as string);
    return files[0].id as string;
  }
  return null;
}

async function createFile(h: Record<string, string>): Promise<string> {
  const boundary = 'ht_boundary';
  const meta = JSON.stringify({ name: FILE_NAME, mimeType: 'text/markdown' });
  const body =
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}` +
    `\r\n--${boundary}\r\nContent-Type: text/markdown\r\n\r\n# Habit Log\r\n--${boundary}--`;

  const res = await fetch(`${UPLOAD_API}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { ...h, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
  const { id } = await res.json();
  localStorage.setItem(FILE_ID_KEY, id as string);
  return id as string;
}

export async function writeFile(content: string): Promise<void> {
  const h = await headers();
  let fileId = await findFileId();
  if (!fileId) fileId = await createFile(h);

  const res = await fetch(`${UPLOAD_API}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { ...h, 'Content-Type': 'text/markdown' },
    body: content,
  });
  if (!res.ok) throw new Error(`Drive write failed: ${res.status}`);
}

export async function readFile(): Promise<string | null> {
  const h = await headers();
  const fileId = await findFileId();
  if (!fileId) return null;

  const res = await fetch(`${FILES_API}/${fileId}?alt=media`, { headers: h });
  if (!res.ok) return null;
  return res.text();
}
