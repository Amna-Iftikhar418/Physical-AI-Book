import React from 'react';
import OriginalDocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import { useDocOverride } from '@site/src/lib/doc-override-context';
import PersonalizeButton from '@site/src/components/PersonalizationBar/PersonalizeButton';
import TranslateButton from '@site/src/components/PersonalizationBar/TranslateButton';

export default function DocBreadcrumbs(props: Record<string, unknown>): React.ReactElement {
  const ctx = useDocOverride();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: '0.5rem', minHeight: '44px', marginBottom: '0.8rem' }}>
      <OriginalDocBreadcrumbs {...props} />
      {ctx && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, paddingLeft: '0.5rem' }}>
          <PersonalizeButton docId={ctx.docId} onPersonalize={ctx.handlePersonalize} />
          <TranslateButton docId={ctx.docId} onTranslate={ctx.handleTranslate} />
        </div>
      )}
    </div>
  );
}
