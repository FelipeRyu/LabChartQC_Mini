/**
 * ARCHIVO: src/services/apiClient.ts
 * MISIÓN: Cliente HTTP centralizado que conecta el frontend con el backend FastAPI.
 * 
 * Todas las peticiones al backend deben pasar por este módulo.
 * Se encarga automáticamente de:
 *   - Usar la URL base del .env (VITE_API_URL)
 *   - Incluir el token JWT en cada petición autenticada
 *   - Manejar errores HTTP de forma consistente
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/** Lee el token JWT guardado en localStorage */
const getToken = (): string | null => {
  return localStorage.getItem('labchartqc_token');
};

/** Construye los headers estándar con autorización */
const buildHeaders = (includeAuth = true): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/** Lanza un error legible si la respuesta HTTP no es exitosa (2xx) */
const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let mensajeError = `Error ${res.status}: ${res.statusText}`;
    try {
      const json = await res.json();
      mensajeError = json.detail || json.mensaje || mensajeError;
    } catch {
      // El cuerpo no es JSON, usamos el mensaje por defecto
    }
    throw new Error(mensajeError);
  }
  // Para respuestas 204 (No Content), no intentamos parsear JSON
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

// ==========================================
// MÉTODOS PÚBLICOS DEL CLIENTE
// ==========================================

export const apiClient = {
  /** Petición GET autenticada */
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse<T>(res);
  },

  /** Petición POST autenticada con body JSON */
  post: async <T>(endpoint: string, body: unknown, includeAuth = true): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(includeAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  /** Petición POST con form-urlencoded (para el login OAuth2 de FastAPI) */
  postForm: async <T>(endpoint: string, formData: URLSearchParams): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    return handleResponse<T>(res);
  },

  /** Petición PUT autenticada con body JSON */
  put: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  /** Petición PATCH autenticada con body JSON */
  patch: async <T>(endpoint: string, body: unknown = {}): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  /** Petición DELETE autenticada */
  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse<T>(res);
  },
};
