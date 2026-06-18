import defaultImage from './assets/default.svg';
import errorImage from './assets/error.svg';
import searchImage from './assets/search.svg';
import networkImage from './assets/network.svg';

/** 内置占位图：default / error / search / network */
export const EMPTY_IMAGES: Record<string, string> = {
  default: defaultImage,
  error: errorImage,
  search: searchImage,
  network: networkImage,
};
