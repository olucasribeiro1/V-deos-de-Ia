import {useId} from 'react';
/** SVG-safe unique id (React's useId contains colons). */
export const useUid = (prefix = 'u') => prefix + useId().replace(/:/g, '');
