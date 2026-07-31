// Minimal Web API types needed by shared ts-rest declarations during React Native typecheck.
// This intentionally avoids enabling the full DOM lib, which conflicts with React Native globals.

declare global {
  type RequestCredentials = "omit" | "same-origin" | "include";
  type RequestCache =
    | "default"
    | "force-cache"
    | "no-cache"
    | "no-store"
    | "only-if-cached"
    | "reload";
  type RequestInfo = string | Request;

  interface AbortSignal {
    readonly aborted: boolean;
    readonly reason?: unknown;
  }

  interface RequestInit {
    readonly method?: string;
    readonly headers?: Headers | readonly (readonly [string, string])[] | Record<string, string>;
    readonly body?: FormData | URLSearchParams | string | null;
    readonly credentials?: RequestCredentials;
    readonly signal?: AbortSignal | null;
    readonly cache?: RequestCache;
    readonly next?: unknown;
  }

  class Request {
    constructor(input: RequestInfo, init?: RequestInit);
  }

  class Headers {
    constructor(init?: Headers | readonly (readonly [string, string])[] | Record<string, string>);
    get(name: string): string | null;
    has(name: string): boolean;
  }

  class URLSearchParams {
    constructor(init?: string | readonly (readonly [string, string])[] | Record<string, string>);
    toString(): string;
  }

  class FormData {
    append(name: string, value: string | File): void;
  }

  class File {
    readonly name: string;
    readonly size: number;
    readonly type: string;
  }
}

export {};
