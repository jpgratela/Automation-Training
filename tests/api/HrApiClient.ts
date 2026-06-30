import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thin wrapper around the HR REST API. This is the API-testing equivalent of a
 * Page Object: tests describe *what* they do (createEmployee, login) instead of
 * repeating URLs, headers and the token dance. Endpoints change in one place.
 */
export class HrApiClient {
  private token: string | null = null;

  constructor(private readonly request: APIRequestContext) {}

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // --- Auth -----------------------------------------------------------------

  /** Log in and remember the token for subsequent calls. Returns the raw response. */
  async login(username: string, password: string): Promise<APIResponse> {
    const res = await this.request.post('/api/auth/login', { data: { username, password } });
    if (res.ok()) this.token = (await res.json()).token;
    return res;
  }

  async register(username: string, password: string, fullName: string): Promise<APIResponse> {
    const res = await this.request.post('/api/auth/register', {
      data: { username, password, fullName },
    });
    if (res.ok()) this.token = (await res.json()).token;
    return res;
  }

  // --- Employees ------------------------------------------------------------

  listEmployees(): Promise<APIResponse> {
    return this.request.get('/api/employees', { headers: this.authHeaders() });
  }

  getEmployee(id: number): Promise<APIResponse> {
    return this.request.get(`/api/employees/${id}`, { headers: this.authHeaders() });
  }

  createEmployee(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/employees', { headers: this.authHeaders(), data });
  }

  updateEmployee(id: number, data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.put(`/api/employees/${id}`, { headers: this.authHeaders(), data });
  }

  deleteEmployee(id: number): Promise<APIResponse> {
    return this.request.delete(`/api/employees/${id}`, { headers: this.authHeaders() });
  }

  // --- Departments ----------------------------------------------------------

  listDepartments(): Promise<APIResponse> {
    return this.request.get('/api/departments', { headers: this.authHeaders() });
  }

  createDepartment(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/departments', { headers: this.authHeaders(), data });
  }
}
