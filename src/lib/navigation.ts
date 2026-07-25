/**
 * Safe navigation helpers — avoid GO_BACK errors when the stack is empty.
 */

import { router } from 'expo-router';

/** Return to the previous screen, or replace with home if there is no back stack. */
export function goBackOrHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/');
}

/** Navigate to the home screen, replacing the current route. */
export function goHome() {
  router.replace('/');
}
