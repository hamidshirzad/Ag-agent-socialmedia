/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_CALENDLY_BOOKING_LINK: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_PAYPAL_MODE: string;
  readonly VITE_PAYPAL_PLAN_ID_STARTER: string;
  readonly VITE_PAYPAL_PLAN_ID_PRO: string;
  readonly VITE_PAYPAL_PLAN_ID_AGENCY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_FACEBOOK_APP_ID: string;
  readonly VITE_LINKEDIN_CLIENT_ID: string;
  readonly VITE_X_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
