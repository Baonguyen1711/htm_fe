import { Button } from '../../../shared/components/ui';

interface ButtonConfig {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ModalProps {
  text: string;
  buttons: ButtonConfig[];
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ text, buttons, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {text}
        </h2>
        <div className="flex justify-center space-x-4">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={button.onClick}
              variant={button.variant === 'danger' ? 'danger' : button.variant === 'secondary' ? 'secondary' : 'primary'}
              size="md"
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;