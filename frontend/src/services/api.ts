import type { MaterialSettings, Project, TexturePreset } from '../types/metanest';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(payload.detail ?? 'MetaNest API request failed.');
  }
  return response.json() as Promise<T>;
}

export const api = {
  upload(file: File, onProgress?: (progress: number) => void): Promise<Project> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const request = new XMLHttpRequest();
      request.open('POST', `${API_URL}/upload`);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText).project as Project);
        } else {
          reject(new Error(JSON.parse(request.responseText || '{}').detail ?? 'Upload failed.'));
        }
      };
      request.onerror = () => reject(new Error('Unable to reach MetaNest API.'));
      request.send(formData);
    });
  },
  async analyze(projectId: string): Promise<Project> {
    return parseResponse<Project>(
      await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      }),
    );
  },
  async generate3d(projectId: string): Promise<Project> {
    return parseResponse<Project>(
      await fetch(`${API_URL}/generate3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      }),
    );
  },
  async listProjects(): Promise<Project[]> {
    return parseResponse<Project[]>(await fetch(`${API_URL}/projects`));
  },
  async listTextures(): Promise<TexturePreset[]> {
    return parseResponse<TexturePreset[]>(await fetch(`${API_URL}/textures`));
  },
  async updateMaterials(projectId: string, materials: MaterialSettings): Promise<Project> {
    return parseResponse<Project>(
      await fetch(`${API_URL}/projects/${projectId}/materials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, materials }),
      }),
    );
  },
  assetUrl(path?: string | null): string | null {
    if (!path) return null;
    return `${API_URL}${path}`;
  },
};
