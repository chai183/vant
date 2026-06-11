export default {
  name: 'Name',
  tel: 'Phone',
  save: 'Save',
  clear: 'Clear',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  loading: 'Loading...',
  noCoupon: 'No coupons',
  nameEmpty: 'Please fill in the name',
  addContact: 'Add contact',
  telInvalid: 'Malformed phone number',
  vanCalendar: {
    end: 'End',
    start: 'Start',
    title: 'Calendar',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthTitle: (year: number, month: number) => `${year}/${month}`,
    rangePrompt: (maxRange: number) => `Choose no more than ${maxRange} days`,
  },
  vanCascader: {
    select: 'Select',
  },
  vanAreaStepCascader: {
    selectArea: 'Select Area',
    selectProvince: 'Select Province',
    selectCity: 'Select City',
    selectDistrict: 'Select District',
  },
  vanFieldMoney: {
    uppercase: 'Amount in words (CN)',
  },
  vanField: {
    labelExpand: 'Expand',
    labelCollapse: 'Collapse',
    maxlengthTip: 'Maximum length reached',
  },
  vanPagination: {
    prev: 'Previous',
    next: 'Next',
  },
  vanPullRefresh: {
    pulling: 'Pull to refresh...',
    loosing: 'Loose to refresh...',
  },
  vanSubmitBar: {
    label: 'Total:',
  },
  vanCoupon: {
    unlimited: 'Unlimited',
    discount: (discount: number) => `${discount * 10}% off`,
    condition: (condition: number) => `At least ${condition}`,
  },
  vanCouponCell: {
    title: 'Coupon',
    count: (count: number) => `You have ${count} coupons`,
  },
  vanCouponList: {
    exchange: 'Exchange',
    close: 'Close',
    enable: 'Available',
    disabled: 'Unavailable',
    placeholder: 'Coupon code',
  },
  vanAddressEdit: {
    area: 'Area',
    areaEmpty: 'Please select a receiving area',
    addressEmpty: 'Address can not be empty',
    addressDetail: 'Address',
    defaultAddress: 'Set as the default address',
  },
  vanAddressList: {
    add: 'Add new address',
  },
  vanRangeInput: {
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastThreeMonths: 'Last 3 months',
  },
  vanCheckboxGroup: {
    searchPlaceholder: 'Enter filter keyword',
    searchEmpty: 'No search results',
  },
  vanRadioGroup: {
    searchPlaceholder: 'Enter filter keyword',
    searchEmpty: 'No search results',
  },
};
