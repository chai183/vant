type Translate = (key: string) => string;

export function createListOptions(t: Translate) {
  return [
    {
      label: t('option1'),
      value: '1',
      cellProps: {
        center: true,
        avatar: { type: 'text', text: 'A', size: 'small' },
      },
    },
    {
      label: t('option2'),
      value: '2',
      cellProps: { label: t('optionDesc') },
    },
    {
      label: t('option3'),
      value: '3',
      disabled: true,
      cellProps: {
        center: true,
      },
    },
    {
      label: [t('option3'), t('optionDesc')],
      value: '3',
      disabled: true,
      cellProps: { icon: 'shop-o' },
    },
  ];
}
