import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import { AuthButton } from '../../../components/Auth/AuthButton';

export default function NavbarContentWrapper(props: Record<string, unknown>): React.ReactElement {
  return (
    <>
      <NavbarContent {...props} />
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        <AuthButton />
      </div>
    </>
  );
}
