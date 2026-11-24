import type { ReactNode } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { Button } from "./Button";
import { Alert } from "./Alert";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Optional subtext shown below the title in the header */
  subtitle?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  disableConfirm?: boolean;
}

/**
 * Reusable confirmation dialog.
 *
 * ```tsx
 * <ConfirmModal
 *   open={confirming}
 *   onClose={() => setConfirming(false)}
 *   onConfirm={handleSave}
 *   title="Save changes?"
 *   description="This will update the customer's record."
 *   confirmLabel="Yes, save"
 *   loading={saving}
 * />
 * ```
 */
export function ConfirmModal({
  open, onClose, onConfirm, title, subtitle, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "primary", loading = false, disableConfirm = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="md" disableBackdropClose={loading}>
      <ModalHeader title={title} description={subtitle} onClose={onClose} />
      {description && (
        <ModalBody>
          {typeof description === "string" ? (
            <p className="t-body text-foreground">{description}</p>
          ) : (
            description
          )}
        </ModalBody>
      )}
      <ModalFooter>
        <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} size="md" loading={loading} disabled={disableConfirm || loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
