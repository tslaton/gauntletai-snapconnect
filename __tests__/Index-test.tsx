import { render } from '@testing-library/react-native';

import Index from '@/app/index';

describe('<Index />', () => {
  test('Text renders correctly on Index', () => {
    const { getByText } = render(<Index />);

    getByText('Zustand + Nativewind');
  });
});
