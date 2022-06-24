export interface RequestError extends Error {
  status?: number;
}

export interface ListenError extends Error {
  code: string;
  syscall?: string;
}
