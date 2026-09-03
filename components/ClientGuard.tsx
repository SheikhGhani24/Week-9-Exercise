'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export function ClientGuard({
children,
}: {
children: React.ReactNode;
}) {
const { token } = useAuth();
const router = useRouter();
const pathname = usePathname();

useEffect(() => {
if (!token) {
router.replace(`/login?next=${encodeURIComponent(pathname)}`);
}
}, [token, pathname, router]);

if (!token) {
return null;
}

return <>{children}</>;
}
