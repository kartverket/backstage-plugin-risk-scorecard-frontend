export interface Config {
  ros?: {
    /**
     * Backend mode: 'native' routes to the Backstage ros backend plugin,
     * 'legacy' routes through the proxy to the Kotlin backend.
     * @visibility frontend
     */
    backend?: 'native' | 'legacy';
  };
}
