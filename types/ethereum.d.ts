declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: string[] }) => Promise<string[] | string>;
      on?: (event: string, handler: (...args: unknown[]) => void | Promise<void>) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void | Promise<void>) => void;
    };
  }
}

export {};
