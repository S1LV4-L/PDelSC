import { useState, type CSSProperties } from 'react';

export function Component({ value: initialState }: { value: number }) {
  const [value, setValue] = useState(initialState);

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={() => setValue(value + 1)}>Incrementar</button>
      <strong>{value}</strong>
      <button style={buttonStyle} onClick={() => setValue(value - 1)}>Decrementar</button>
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  alignItems: 'center',
  fontSize: 20,
  gap: '1rem',
  fontFamily: 'arial',
};

const buttonStyle: CSSProperties = {
  all: 'unset',
  borderRadius: 100,
  padding: '.5rem 1rem',
  background: 'black',
  color: 'white',
  cursor: 'pointer',
  fontFamily: 'unset',
  fontSize: 14,
};