import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import { AuthButton } from '../../../components/Auth/AuthButton';

export default function NavbarContentWrapper(props: Record<string, unknown>): React.ReactElement {
  return (
    <>
      <NavbarContent {...props} />
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, paddingLeft: '0.5rem' }}>
        <AuthButton />
      </div>
    </>
  );
}
