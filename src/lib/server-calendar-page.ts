import axios, { type AxiosAdapter } from 'axios';
import { NextRequest } from 'next/server';
import { getBffCalendar } from '@mairie360/bff-calendar-openapi/endpoints/bffCalendar';
import { isExpiredJwt, publicOrigin } from '@mairie360/lib-components/shared';
import { proxyBffRequest } from './bff-proxy';
import { parseCalendarBootstrapReceipt, CALENDAR_INITIAL_UNAVAILABLE, type InitialCalendarPage } from './calendar-bootstrap-receipt';
import type { CalendarPageQuery } from '@/app/calendar/page-query';
import { formatDateForQuery, getCalendarPeriodRange } from '@/app/calendar/date-utils';

export async function loadInitialCalendarPage(accessToken: string | undefined, query: CalendarPageQuery): Promise<InitialCalendarPage> {
  const unavailable = { status: 'unavailable' as const, message: CALENDAR_INITIAL_UNAVAILABLE };
  const origin = publicOrigin(process.env.CALENDAR_FRONT_URL);
  if (!origin || isExpiredJwt(accessToken)) return unavailable;
  const adapter: AxiosAdapter = async config => {
    const target = new URL(axios.getUri(config), origin);
    if (config.method?.toUpperCase() !== 'GET' || target.origin !== origin) throw new Error(CALENDAR_INITIAL_UNAVAILABLE);
    const request = new NextRequest(target, { method: 'GET', headers: { Accept: 'application/json', Cookie: `accessToken=${encodeURIComponent(accessToken!)}` } });
    const response = await proxyBffRequest(request, { params: Promise.resolve({ path: target.pathname.split('/').filter(Boolean).map(decodeURIComponent) }) });
    if (!response.ok) { await response.body?.cancel(); throw new Error(CALENDAR_INITIAL_UNAVAILABLE); }
    return { data: await response.json(), status: response.status, statusText: response.statusText, headers: {}, config };
  };
  try {
    const api = getBffCalendar(axios.create({ adapter }));
    const range = getCalendarPeriodRange(query.view, query.date);
    const { data } = await api.getCalendarBootstrap({ from: formatDateForQuery(range.from), to: formatDateForQuery(range.to) });
    return { status: 'confirmed', query, data: parseCalendarBootstrapReceipt(data) };
  } catch { return unavailable; }
}
