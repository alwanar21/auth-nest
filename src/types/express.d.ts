declare module 'express' {
  export interface Request {
    headers: any;
    user?: { id: string; roles?: user | admin };
  }
}
