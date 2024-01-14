'use client';
import { SessionProvider as Provider, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

type Props = {
    children: React.ReactNode;
}

export default function SessionProvider({ children }: Props) {
    return (
        <Provider>
            {children}
        </Provider>
    )
}