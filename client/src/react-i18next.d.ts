// filepath: c:\Users\Danila\Desktop\ITtransition\task5\client\src\react-i18next.d.ts
import 'react-i18next';
import en from './locales/en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
