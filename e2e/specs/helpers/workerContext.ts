export type WorkerEnv = {
  workerIndex: number;
  apiPort: number;
  frontendPort: number;
  apiBaseUrl: string;
  frontendBaseUrl: string;
  dbFile: string;
  databaseUrl: string;
};

let workerApiBaseUrl = 'http://127.0.0.1:8001';
let workerFrontendBaseUrl = 'http://127.0.0.1:5174';

export function setWorkerEnv(env: WorkerEnv): void {
  workerApiBaseUrl = env.apiBaseUrl;
  workerFrontendBaseUrl = env.frontendBaseUrl;
}

export function getWorkerApiBaseUrl(): string {
  return workerApiBaseUrl;
}

export function getWorkerFrontendBaseUrl(): string {
  return workerFrontendBaseUrl;
}
