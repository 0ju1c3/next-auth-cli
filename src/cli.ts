#!/usr/bin/env node

import { setupNextAuth } from './index.js';

setupNextAuth().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
