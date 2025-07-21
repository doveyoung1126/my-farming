import { redirect } from 'next/navigation';

// This component will permanently redirect users from the root path ("/")
// to the main dashboard at "/newdashboard".
export default function HomePage() {
  redirect('/newdashboard');
  
  // According to Next.js documentation, a component that calls redirect
  // should not return any JSX. It interrupts the rendering process.
  return null;
}
