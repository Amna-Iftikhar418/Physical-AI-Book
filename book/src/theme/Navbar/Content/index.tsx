import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import { AuthButton } from '../../../components/Auth/AuthButton';

export default function NavbarContentWrapper(props: Record<string, unknown>): React.ReactElement {
  return (
    <>
      <NavbarContent {...props} />
      <div className="navbar-auth-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem' }}>
        <AuthButton />
      </div>
    </>
  );
}
