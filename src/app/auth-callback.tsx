/**
 * Google sign-in returns to roomorph://auth-callback. The sign-in screen
 * finishes the session itself; if the system opens this route instead, just go home.
 */
import { Redirect } from 'expo-router';

export default function AuthCallback() {
  return <Redirect href="/" />;
}
