import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  name = 'password',
  required = true,
  minLength,
  autoComplete = 'current-password',
  className = 'form-control'
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        className={className}
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        style={{ paddingRight: '2.75rem', width: '100%' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}