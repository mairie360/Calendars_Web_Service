import type { ReactNode } from 'react';

export type SaveFeedback = { saving?: boolean; error?: string | null };

/** Subtitle of a dialog followed by the pending save or the refusal. */
export function ModalFeedback({ subtitle, saving, error }: SaveFeedback & { subtitle?: ReactNode }) {
  return (
    <>
      {subtitle}
      {saving || error ? (
        <span role={saving ? 'status' : 'alert'} className="mt-2 block font-semibold text-[#334155]">
          {saving ? 'Enregistrement en cours…' : error}
        </span>
      ) : null}
    </>
  );
}
