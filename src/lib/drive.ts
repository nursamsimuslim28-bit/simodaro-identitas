import { SchoolIdentity } from '../types';
import { getAccessToken } from './auth';

export const getOrCreateFolder = async (accessToken: string, name: string, parentId?: string) => {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''}`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    })
  });
  const createData = await createRes.json();
  return createData.id;
};

export const getFileId = async (accessToken: string, name: string, parentId: string) => {
  const query = `name='${name}' and trashed=false and '${parentId}' in parents`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

export const getFileContent = async (accessToken: string, fileId: string) => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return null;
  return res.json();
};

export const generateFileName = (mapel: string, fase: string, kelas: string) => {
  const cleanMapel = mapel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  return `identitas_${cleanMapel}_${fase}_${kelas}.json`;
};

export const saveIdentityToDrive = async (accessToken: string, guruId: string, identityData: SchoolIdentity) => {
  // 1. Get or create root folder siModArO-Database
  const rootFolderId = await getOrCreateFolder(accessToken, 'siModArO-Database');
  
  // 2. Get or create guru specific folder
  const guruFolderId = await getOrCreateFolder(accessToken, guruId, rootFolderId);
  
  // 3. Check if file exists based on Mapel, Fase, and Kelas
  const fileName = generateFileName(identityData.mataPelajaran, identityData.fase, identityData.kelas);
  const existingId = await getFileId(accessToken, fileName, guruFolderId);
  
  const metadata = {
    name: fileName,
    parents: existingId ? undefined : [guruFolderId],
    mimeType: 'application/json'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(identityData, null, 2)], { type: 'application/json' }));

  const url = existingId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const method = existingId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!res.ok) {
    throw new Error('Failed to save to Google Drive');
  }

  return res.json();
};

export const getLatestIdentityFileId = async (accessToken: string, parentId: string) => {
  const query = `name contains 'identitas_' and name contains '.json' and trashed=false and '${parentId}' in parents`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

export const loadIdentityFromDrive = async (accessToken: string, guruId: string, specificMapel?: string, specificFase?: string, specificKelas?: string): Promise<SchoolIdentity | null> => {
  const rootFolderId = await getOrCreateFolder(accessToken, 'siModArO-Database');
  const guruFolderId = await getOrCreateFolder(accessToken, guruId, rootFolderId);
  
  let fileId = null;
  if (specificMapel && specificFase && specificKelas) {
    const fileName = generateFileName(specificMapel, specificFase, specificKelas);
    fileId = await getFileId(accessToken, fileName, guruFolderId);
  }
  
  if (!fileId) {
    // Fallback to load the latest saved identity file if no specific config is requested or found
    fileId = await getLatestIdentityFileId(accessToken, guruFolderId);
  }
  
  if (fileId) {
    return getFileContent(accessToken, fileId);
  }
  return null;
}
