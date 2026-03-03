import { AsyncLocalStorage } from 'async_hooks';

export class RequestContextService {
  private static readonly storage = new AsyncLocalStorage<Map<string, any>>();

  static run(next: () => void) {
    this.storage.run(new Map(), next);
  }

  static set(key: string, value: any) {
    const store = this.storage.getStore();
    if (store) store.set(key, value);
  }

  static get(key: string): any {
    return this.storage.getStore()?.get(key);
  }
}
