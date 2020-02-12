import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
    faTimesCircle,
    faSearchPlus,
    faSearchMinus,
    faPenSquare,
    faSave,
} from '@fortawesome/free-solid-svg-icons';
library.add(faTimesCircle);
library.add(faSearchPlus);
library.add(faSearchMinus);
library.add(faPenSquare);
library.add(faSave);

export default FontAwesomeIcon;
