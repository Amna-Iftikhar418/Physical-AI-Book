import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import { AuthButton } from '../../../components/Auth/AuthButton';

export default function NavbarContentWrapper(props: Record<string, unknown>): React.ReactElement {
  return (
    <>
      <NavbarContent {...props} />
      {/* flexShrink: 1 lets this wrapper compress when the navbar is narrow (mobile) */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 1, paddingLeft: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
        <AuthButton />
      </div>
    </>
  );
}
