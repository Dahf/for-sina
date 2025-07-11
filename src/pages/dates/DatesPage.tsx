import { DatesManager } from '../../components/dates/DatesManager';
import { PageLayout } from '../../components/shared/PageLayout';

import './DatesPage.css';

export function DatesPage() {
  return (
    <PageLayout>
      <div className="dates-page-content">
        <DatesManager />
      </div>
    </PageLayout>
  );
} 