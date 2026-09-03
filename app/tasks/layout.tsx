import { ClientGuard } from '@/components/ClientGuard';

export default function TasksLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return <ClientGuard>{children}</ClientGuard>;
}
