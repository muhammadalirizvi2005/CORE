import React from 'react';

interface ModalProps {
  title?: string;
  initialValue?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
}

export function Modal({ title, initialValue = '', open, onClose, onSubmit, placeholder }: ModalProps) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-medium mb-3">{title}</h3>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2 mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button onClick={() => onSubmit(value)} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
