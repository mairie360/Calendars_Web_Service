import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from '@/components/calendar/StatsPanel';
it('keeps each supplied statistic associated with its value', () => {
  render(<StatsPanel stats={[{ label: 'Réunions', value: 8 }, { label: 'Participants', value: 24 }]} />); expect(screen.getByText('Réunions').closest('div')).toHaveTextContent('8'); expect(screen.getByText('Participants').closest('div')).toHaveTextContent('24');
});
