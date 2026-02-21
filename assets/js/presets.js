'use strict';

const BUILTIN_BOARDS = [
    {
        "name":  "5*6",
        "width":  5,
        "height":  6,
        "riverRow":  2,
        "palace":  {
                       "black":  {
                                     "left":  2,
                                     "top":  0,
                                     "width":  1,
                                     "height":  1
                                 },
                       "red":  {
                                   "left":  2,
                                   "top":  5,
                                   "width":  1,
                                   "height":  1
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  1,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  1,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  1,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  4,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  4,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  4,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  5,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  5,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  5,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  5,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  5,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "7*8",
        "width":  7,
        "height":  8,
        "riverRow":  3,
        "palace":  {
                       "black":  {
                                     "left":  2,
                                     "top":  0,
                                     "width":  3,
                                     "height":  2
                                 },
                       "red":  {
                                   "left":  2,
                                   "top":  6,
                                   "width":  3,
                                   "height":  2
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  2,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  3,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  5,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  5,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  7,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  7,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  7,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  7,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  7,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  7,
                           "type":  "q",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "9*10",
        "width":  9,
        "height":  10,
        "riverRow":  4,
        "palace":  {
                       "black":  {
                                     "left":  3,
                                     "top":  0,
                                     "width":  3,
                                     "height":  3
                                 },
                       "red":  {
                                   "left":  3,
                                   "top":  7,
                                   "width":  3,
                                   "height":  3
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  8,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  8,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  8,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  8,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  9,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  9,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "15*10",
        "width":  15,
        "height":  10,
        "riverRow":  4,
        "palace":  {
                       "black":  {
                                     "left":  4,
                                     "top":  0,
                                     "width":  3,
                                     "height":  3
                                 },
                       "red":  {
                                   "left":  8,
                                   "top":  7,
                                   "width":  3,
                                   "height":  3
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  8,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  9,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  10,
                           "y":  0,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  11,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  12,
                           "y":  0,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  14,
                           "y":  0,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  1,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  11,
                           "y":  1,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  9,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  14,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  7,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  9,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  11,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  12,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  2,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  12,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  14,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  13,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  8,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  10,
                           "y":  8,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  9,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  9,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  9,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  9,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  9,
                           "y":  9,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  10,
                           "y":  9,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  11,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  12,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  13,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  14,
                           "y":  9,
                           "type":  "c",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "19*10",
        "width":  19,
        "height":  10,
        "riverRow":  4,
        "palace":  {
                       "black":  {
                                     "left":  0,
                                     "top":  2,
                                     "width":  4,
                                     "height":  4
                                 },
                       "red":  {
                                   "left":  15,
                                   "top":  4,
                                   "width":  4,
                                   "height":  4
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  17,
                           "y":  0,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  18,
                           "y":  0,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  1,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  1,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  9,
                           "y":  1,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  10,
                           "y":  1,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  1,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  14,
                           "y":  1,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  1,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  2,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  2,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  8,
                           "y":  2,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  9,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  11,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  12,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  18,
                           "y":  2,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  3,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  3,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  3,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  10,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  4,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  4,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  4,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  16,
                           "y":  4,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  4,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  5,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  5,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  13,
                           "y":  5,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  5,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  5,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  5,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  9,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  13,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  6,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  6,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  6,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  7,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  7,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  11,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  12,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  13,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  7,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  7,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  8,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  8,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  8,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  8,
                           "y":  8,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  9,
                           "y":  8,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  8,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  8,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  13,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "8*18",
        "width":  8,
        "height":  18,
        "riverRow":  8,
        "palace":  {
                       "black":  {
                                     "left":  3,
                                     "top":  0,
                                     "width":  2,
                                     "height":  4
                                 },
                       "red":  {
                                   "left":  3,
                                   "top":  14,
                                   "width":  2,
                                   "height":  4
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  1,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  1,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  2,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  2,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  4,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  3,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  7,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  7,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  7,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  7,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  7,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  2,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  10,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  10,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  10,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  10,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  4,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  2,
                           "y":  13,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  13,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  4,
                           "y":  13,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  15,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  15,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  15,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  15,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  16,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  16,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  16,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  16,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  17,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  17,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  17,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  17,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  17,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  17,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "肉搏",
        "width":  9,
        "height":  10,
        "riverRow":  4,
        "palace":  {
                       "black":  {
                                     "left":  1,
                                     "top":  1,
                                     "width":  6,
                                     "height":  6
                                 },
                       "red":  {
                                   "left":  2,
                                   "top":  3,
                                   "width":  6,
                                   "height":  6
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  1,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  1,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  3,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  3,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  4,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  7,
                           "y":  5,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  4,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  6,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  6,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  7,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  8,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  8,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  8,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  8,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  9,
                           "type":  "q",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "赛车",
        "width":  20,
        "height":  20,
        "riverRow":  9,
        "palace":  {
                       "black":  {
                                     "left":  0,
                                     "top":  0,
                                     "width":  1,
                                     "height":  1
                                 },
                       "red":  {
                                   "left":  19,
                                   "top":  19,
                                   "width":  1,
                                   "height":  1
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  1,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  12,
                           "y":  1,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  2,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  18,
                           "y":  2,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  3,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  11,
                           "y":  3,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  4,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  16,
                           "y":  4,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  5,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  6,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  18,
                           "y":  7,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  3,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  7,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  12,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  16,
                           "y":  8,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  9,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  10,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  10,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  10,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  10,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  3,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  7,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  12,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  16,
                           "y":  11,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  1,
                           "y":  12,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  10,
                           "y":  12,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  18,
                           "y":  12,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  13,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  13,
                           "y":  13,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  9,
                           "y":  14,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  3,
                           "y":  15,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  14,
                           "y":  15,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  19,
                           "y":  15,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  8,
                           "y":  16,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  19,
                           "y":  16,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  17,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  15,
                           "y":  17,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  19,
                           "y":  17,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  7,
                           "y":  18,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  19,
                           "y":  18,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  16,
                           "y":  19,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  17,
                           "y":  19,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  18,
                           "y":  19,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  19,
                           "y":  19,
                           "type":  "g",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "进攻",
        "width":  7,
        "height":  10,
        "riverRow":  2,
        "palace":  {
                       "black":  {
                                     "left":  2,
                                     "top":  0,
                                     "width":  3,
                                     "height":  3
                                 },
                       "red":  {
                                   "left":  3,
                                   "top":  9,
                                   "width":  1,
                                   "height":  1
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  1,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  1,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  1,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  1,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  2,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  5,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  7,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  8,
                           "type":  "q",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  9,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  9,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    },
    {
        "name":  "防守",
        "width":  7,
        "height":  10,
        "riverRow":  6,
        "palace":  {
                       "black":  {
                                     "left":  2,
                                     "top":  0,
                                     "width":  3,
                                     "height":  3
                                 },
                       "red":  {
                                   "left":  2,
                                   "top":  7,
                                   "width":  3,
                                   "height":  3
                               }
                   },
        "pieces":  [
                       {
                           "x":  0,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  0,
                           "type":  "g",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  0,
                           "type":  "a",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  0,
                           "type":  "h",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  0,
                           "type":  "r",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  1,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  1,
                           "type":  "q",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  1,
                           "type":  "e",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  5,
                           "y":  2,
                           "type":  "c",
                           "color":  "black"
                       },
                       {
                           "x":  0,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  2,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  3,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  4,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  6,
                           "y":  4,
                           "type":  "p",
                           "color":  "black"
                       },
                       {
                           "x":  1,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  5,
                           "y":  6,
                           "type":  "b",
                           "color":  null
                       },
                       {
                           "x":  0,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  7,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  7,
                           "type":  "e",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  7,
                           "type":  "p",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  8,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  8,
                           "type":  "c",
                           "color":  "red"
                       },
                       {
                           "x":  0,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       },
                       {
                           "x":  1,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  2,
                           "y":  9,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  3,
                           "y":  9,
                           "type":  "g",
                           "color":  "red"
                       },
                       {
                           "x":  4,
                           "y":  9,
                           "type":  "a",
                           "color":  "red"
                       },
                       {
                           "x":  5,
                           "y":  9,
                           "type":  "h",
                           "color":  "red"
                       },
                       {
                           "x":  6,
                           "y":  9,
                           "type":  "r",
                           "color":  "red"
                       }
                   ]
    }
];

