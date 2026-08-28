import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CustomAlertModal } from '../components/dialogs/modals/CustomAlertModal';
import { CustomConfirmModal } from '../components/dialogs/modals/CustomConfirmModal';
import { CustomPromptModal } from '../components/dialogs/modals/CustomPromptModal';
import { ParchmentMessageModal } from '../components/dialogs/modals/ParchmentMessageModal';
import { useDialog } from '../context/DialogContext';
import { renderWithProviders } from '../test/test-utils';

describe('Modal & Dialog UI Components (Task 6.1.2)', () => {
  describe('CustomAlertModal', () => {
    it('renders title, message, icon and handles close click', () => {
      const handleClose = vi.fn();
      render(
        <CustomAlertModal
          title="Spell Slot Depleted"
          message="<strong>Warning:</strong> You have no level 3 slots remaining."
          icon="⚡"
          buttonText="Acknowledge"
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/Spell Slot Depleted/i)).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText(/You have no level 3 slots remaining./i)).toBeInTheDocument();

      const btn = screen.getByRole('button', { name: /Acknowledge/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('triggers onClose when clicking the background overlay', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <CustomAlertModal
          title="Alert"
          message="Click outside to close."
          onClose={handleClose}
        />
      );

      const overlay = container.querySelector('#customAlertOverlay');
      expect(overlay).toBeInTheDocument();
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('CustomConfirmModal', () => {
    it('renders confirmation text and handles Yes and No actions', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      const { rerender } = render(
        <CustomConfirmModal
          title="Take Rest"
          messageHtml="Are you sure you want to take a <em>Long Rest</em>?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      expect(screen.getByText('Take Rest')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to take a/i)).toBeInTheDocument();

      const yesBtn = screen.getByRole('button', { name: /Yes/i });
      const noBtn = screen.getByRole('button', { name: /No/i });

      fireEvent.click(yesBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
      expect(handleCancel).not.toHaveBeenCalled();

      rerender(
        <CustomConfirmModal
          title="Take Rest"
          messageHtml="Are you sure?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      fireEvent.click(noBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('CustomPromptModal', () => {
    it('allows editing default input and confirms on Submit or Enter key', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <CustomPromptModal
          title="Damage Roll Override"
          message="Enter additional fire damage modifier:"
          defaultValue="4"
          buttonText="Apply"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('4');

      fireEvent.change(input, { target: { value: '8' } });
      expect(input).toHaveValue('8');

      const submitBtn = screen.getByRole('button', { name: /Apply/i });
      fireEvent.click(submitBtn);
      expect(handleConfirm).toHaveBeenCalledWith('8');

      // Test Enter key submit
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      expect(handleConfirm).toHaveBeenCalledWith('8');

      // Test Escape key cancel
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('ParchmentMessageModal', () => {
    it('renders message and sender, and allows dismissal', () => {
      const handleClose = vi.fn();
      render(
        <ParchmentMessageModal
          text="A dark shadow moves across the dungeon floor..."
          sender="Dungeon Master"
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/Message from:\s*Dungeon Master/i)).toBeInTheDocument();
      expect(screen.getByText(/A dark shadow moves across the dungeon floor.../i)).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('DialogContext Integration', () => {
    const TestConsumer: React.FC = () => {
      const dialog = useDialog();

      return (
        <div>
          <button
            onClick={() =>
              dialog.showAlert('Context Alert Title', 'Context Alert Message Body')
            }
          >
            Trigger Alert
          </button>
          <button
            onClick={() =>
              dialog.showConfirm('Context Confirm', 'Proceed with deletion?', () => {})
            }
          >
            Trigger Confirm
          </button>
          <button
            onClick={() =>
              dialog.showPrompt('Context Prompt', 'Enter value:', '10', 'Save', () => {})
            }
          >
            Trigger Prompt
          </button>
        </div>
      );
    };

    it('opens and closes alert modal via useDialog hook', () => {
      renderWithProviders(<TestConsumer />);

      expect(screen.queryByText('Context Alert Title')).not.toBeInTheDocument();

      const triggerBtn = screen.getByRole('button', { name: /Trigger Alert/i });
      act(() => {
        fireEvent.click(triggerBtn);
      });

      expect(screen.getByText('Context Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Context Alert Message Body')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /Understood/i });
      act(() => {
        fireEvent.click(closeBtn);
      });

      expect(screen.queryByText('Context Alert Title')).not.toBeInTheDocument();
    });

    it('opens confirm modal via useDialog hook and closes on choice', () => {
      renderWithProviders(<TestConsumer />);

      const triggerBtn = screen.getByRole('button', { name: /Trigger Confirm/i });
      act(() => {
        fireEvent.click(triggerBtn);
      });

      expect(screen.getByText('Context Confirm')).toBeInTheDocument();
      expect(screen.getByText('Proceed with deletion?')).toBeInTheDocument();

      const noBtn = screen.getByRole('button', { name: /No/i });
      act(() => {
        fireEvent.click(noBtn);
      });

      expect(screen.queryByText('Context Confirm')).not.toBeInTheDocument();
    });
  });
});
