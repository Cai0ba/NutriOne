import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d46f3da509184aeaa4293e4d8adeedb8@o4511669263269888.ingest.us.sentry.io/4511669267726336",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
});
