import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';
import dotenv from 'dotenv';

dotenv.config();

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: true,
};

const emailChannel = new EmailAlertChannel('email-channel-1', {
  // FIXME: add your own email address, Checkly will send you an email notification if a check fails
  address: 'support@templify.cloud',
  ...sendDefaults,
});

export const config = defineConfig({
  // FIXME: Add your own project name, logical ID, and repository URL
  projectName: 'Templify dashboard',
  logicalId: 'templify-dashboard',
  repoUrl: 'https://github.com/prathamudeshmukh/dashboard',
  checks: {
    activated: true,
    locations: ['ap-south-1'],
    tags: ['website'],
    checkMatch: '**/__checks__/*.check.ts',
    runtimeId: '2025.04',
    browserChecks: {
      frequency: Frequency.EVERY_10M,
      testMatch: '**/__checks__/*.spec.ts',
      alertChannels: [emailChannel],
    },
    playwrightConfig: {
      use: {
        baseURL: process.env.ENVIRONMENT_URL,
        extraHTTPHeaders: {
          'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
        },
      },
    },
  },
  cli: {
    runLocation: 'ap-south-1',
    reporters: ['list'],
  },
});

export default config;
