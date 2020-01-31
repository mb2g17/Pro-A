import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
    faTimesCircle,
    faSearchPlus,
    faSearchMinus
} from '@fortawesome/free-solid-svg-icons';
library.add(faTimesCircle);
library.add(faSearchPlus);
library.add(faSearchMinus);

export default FontAwesomeIcon;