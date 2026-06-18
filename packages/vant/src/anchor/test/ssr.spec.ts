import { Anchor } from '..';
import { renderComponentToString } from '../../../test';

test('should render correctly when SSR', async () => {
  const html = await renderComponentToString(Anchor, {
    teleport: '',
  });
  expect(html).toMatchSnapshot();
});
