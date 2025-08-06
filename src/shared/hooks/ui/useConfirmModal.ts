import { useState } from 'react';

interface ButtonConfig {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ModalState {
  isOpen: boolean;
  text: string;
  buttons: ButtonConfig[];
}

interface UseConfirmModalReturn {
  modalState: ModalState;
  showConfirmModal: (config: {
    text: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'danger';
  }) => void;
  closeModal: () => void;
}

export const useConfirmModal = (): UseConfirmModalReturn => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    text: '',
    buttons: []
  });

  const showConfirmModal = ({
    text,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmVariant = 'primary'
  }: {
    text: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'danger';
  }) => {
    const buttons: ButtonConfig[] = [
      {
        text: cancelText,
        onClick: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          onCancel?.();
        },
        variant: 'secondary'
      },
      {
        text: confirmText,
        onClick: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          onConfirm();
        },
        variant: confirmVariant
      }
    ];

    setModalState({
      isOpen: true,
      text,
      buttons
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    modalState,
    showConfirmModal,
    closeModal
  };
};

export default useConfirmModal;
