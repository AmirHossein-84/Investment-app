import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.investment.portfolio',
  appName: 'مدیریت سرمایه',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0B0F17',
    allowMixedContent: true
  }
};

export default config;
