import React from 'react';
import { cookies } from 'next/headers';
import { createNonce } from '@mairie360/lib-components/shared';
import { serverCalendarQuery } from './calendar/page-query';
import { loadInitialCalendarPage } from '@/lib/server-calendar-page';
import CalendarClient from './calendar-client';
export const dynamic = 'force-dynamic';
export default async function CalendarPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const query = serverCalendarQuery(await searchParams ?? {});
  const initial = await loadInitialCalendarPage((await cookies()).get('accessToken')?.value, query);
  return <CalendarClient key={createNonce()} initial={initial} />;
}
