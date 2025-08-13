import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProgramWeekView from '@/components/ProgramWeekView';

expect.extend(toHaveNoViolations as any);

it('ProgramWeekView has no a11y violations', async () => {
  const { container } = render(<ProgramWeekView weekNumber={1} days={[]} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});


