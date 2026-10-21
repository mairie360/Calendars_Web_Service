import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
it('uses explicitly supplied statistics and events instead of deriving replacement data', () => { render(<CalendarSidebar currentDate="2026-10-15" events={[]} upcomingEvents={[{ id: 1, title: 'Conseil', date: '2026-10-16' }]} stats={[{ label: 'Confirmés', value: 4 }]} />); expect(screen.getByText('Conseil')).toBeVisible(); expect(screen.getByText('Confirmés').closest('div')).toHaveTextContent('4'); });
