// Note valid values: A, A#, B, C, C#, D, D#, E, F, F#, G, G#
// Duration valid values: 1n, 2n, 4n, 8n, 16n, 32n, 64n
// Octave valid values: 0 to 8n

// 🎼 Right Hand (Melody - Treble Clef)
export const froggerSong = {
    // 🎶 Left Hand (Accompaniment - Bass Clef)
    leftHand: [
        // Measure 1
        { note: 'C', octave: 2, duration: '2n', beat: 0 },
        { note: 'C', octave: 2, duration: '2n', beat: 2 },

        // Measure 2
        { note: 'F', octave: 2, duration: '2n', beat: 4 },
        { note: 'G', octave: 2, duration: '2n', beat: 6 },

        // Measure 3
        { note: 'C', octave: 2, duration: '2n', beat: 8 },
        { note: 'G', octave: 2, duration: '2n', beat: 10 },

        // Measure 4
        { note: 'F', octave: 2, duration: '1n', beat: 12 },

        // Measure 5
        { note: 'D', octave: 2, duration: '2n', beat: 16 },
        { note: 'D', octave: 2, duration: '2n', beat: 18 },

        // Measure 6
        { note: 'G', octave: 2, duration: '2n', beat: 20 },
        { note: 'A', octave: 2, duration: '2n', beat: 22 },

        // Measure 7
        { note: 'D', octave: 2, duration: '2n', beat: 24 },
        { note: 'A', octave: 2, duration: '2n', beat: 26 },

        // Measure 8
        { note: 'G', octave: 2, duration: '1n', beat: 28 }
    ],
    // 🎶 Right Hand (Melody - Treble Clef)    
    rightHand: [
        // Measure 1
        { note: 'E', octave: 3, duration: '4n', beat: 0 },
        { note: 'E', octave: 3, duration: '4n', beat: 1 },
        { note: 'F', octave: 3, duration: '4n', beat: 2 },
        { note: 'G', octave: 3, duration: '4n', beat: 3 },

        // Measure 2
        { note: 'E', octave: 3, duration: '4n', beat: 4 },
        { note: 'G', octave: 3, duration: '4n', beat: 5 },
        { note: 'F', octave: 3, duration: '2n', beat: 6 },

        // Measure 3
        { note: 'D', octave: 3, duration: '4n', beat: 8 },
        { note: 'D', octave: 3, duration: '4n', beat: 9 },
        { note: 'E', octave: 3, duration: '4n', beat: 10 },
        { note: 'F', octave: 3, duration: '4n', beat: 11 },

        // Measure 4
        { note: 'D', octave: 3, duration: '4n', beat: 12 },
        { note: 'F', octave: 3, duration: '4n', beat: 13 },
        { note: 'E', octave: 3, duration: '2n', beat: 14 },

        // Measure 5
        { note: 'C', octave: 3, duration: '4n', beat: 16 },
        { note: 'C', octave: 3, duration: '4n', beat: 17 },
        { note: 'D', octave: 3, duration: '4n', beat: 18 },
        { note: 'E', octave: 3, duration: '4n', beat: 19 },

        // Measure 6
        { note: 'C', octave: 3, duration: '4n', beat: 20 },
        { note: 'E', octave: 3, duration: '4n', beat: 21 },
        { note: 'D', octave: 3, duration: '2n', beat: 22 },

        // Measure 7
        { note: 'G', octave: 2, duration: '4n', beat: 24 },
        { note: 'G', octave: 2, duration: '4n', beat: 25 },
        { note: 'C', octave: 3, duration: '4n', beat: 26 },
        { note: 'A', octave: 2, duration: '4n', beat: 27 },

        // Measure 8
        { note: 'D', octave: 3, duration: '4n', beat: 28 },
        { note: 'B', octave: 2, duration: '4n', beat: 29 },
        { note: 'C', octave: 3, duration: '2n', beat: 30 }
    ]
};

export const shellBeSongComingAroundMountain = {
    leftHand: [
        // Measure 1
        { note: 'C', octave: 3, duration: '1n', beat: 1 }, // C major chord (C-E-G)

        // Measure 2
        { note: 'G', octave: 3, duration: '1n', beat: 5 }, // G major chord (G-B-D)

        // Measure 3
        { note: 'C', octave: 3, duration: '1n', beat: 9 }, // C major chord (C-E-G)

        // Measure 4
        { note: 'F', octave: 3, duration: '1n', beat: 13 }, // F major chord (F-A-C)

        // Measure 5
        { note: 'C', octave: 3, duration: '1n', beat: 17 }, // C major chord (C-E-G)

        // Measure 6
        { note: 'G', octave: 3, duration: '1n', beat: 21 }, // G major chord (G-B-D)

        // Measure 7
        { note: 'C', octave: 3, duration: '1n', beat: 25 }, // C major chord (C-E-G)

        // Measure 8
        { note: 'G', octave: 3, duration: '1n', beat: 29 } // G major chord (G-B-D)
    ],
    rightHand: [
        // Measure 1
        { note: 'C', octave: 4, duration: '4n', beat: 1 },
        { note: 'D', octave: 4, duration: '4n', beat: 2 },
        { note: 'E', octave: 4, duration: '4n', beat: 3 },
        { note: 'C', octave: 4, duration: '4n', beat: 4 },

        // Measure 2
        { note: 'E', octave: 4, duration: '4n', beat: 5 },
        { note: 'F', octave: 4, duration: '4n', beat: 6 },
        { note: 'G', octave: 4, duration: '2n', beat: 7 },

        // Measure 3
        { note: 'G', octave: 4, duration: '4n', beat: 9 },
        { note: 'A', octave: 4, duration: '4n', beat: 10 },
        { note: 'G', octave: 4, duration: '4n', beat: 11 },
        { note: 'F', octave: 4, duration: '4n', beat: 12 },

        // Measure 4
        { note: 'E', octave: 4, duration: '4n', beat: 13 },
        { note: 'F', octave: 4, duration: '4n', beat: 14 },
        { note: 'G', octave: 4, duration: '2n', beat: 15 },

        // Measure 5
        { note: 'C', octave: 4, duration: '4n', beat: 17 },
        { note: 'D', octave: 4, duration: '4n', beat: 18 },
        { note: 'E', octave: 4, duration: '4n', beat: 19 },
        { note: 'C', octave: 4, duration: '4n', beat: 20 },

        // Measure 6
        { note: 'E', octave: 4, duration: '4n', beat: 21 },
        { note: 'F', octave: 4, duration: '4n', beat: 22 },
        { note: 'G', octave: 4, duration: '2n', beat: 23 },

        // Measure 7
        { note: 'G', octave: 4, duration: '4n', beat: 25 },
        { note: 'A', octave: 4, duration: '4n', beat: 26 },
        { note: 'G', octave: 4, duration: '4n', beat: 27 },
        { note: 'F', octave: 4, duration: '4n', beat: 28 },

        // Measure 8
        { note: 'E', octave: 4, duration: '4n', beat: 29 },
        { note: 'F', octave: 4, duration: '4n', beat: 30 },
        { note: 'G', octave: 4, duration: '2n', beat: 31 }
    ]
};

export const twinkleTwinkle = {
    // 🎶 Left Hand (Accompaniment - Bass Clef)
    leftHand: [
        // Measure 1
        { note: 'C', octave: 3, duration: '1n', beat: 1 }, // C major chord (C-E-G)
        { note: 'E', octave: 3, duration: '1n', beat: 1 }, // C major chord (C-E-G)
        { note: 'G', octave: 3, duration: '1n', beat: 1 }, // C major chord (C-E-G)

        // Measure 2
        { note: 'G', octave: 3, duration: '1n', beat: 5 }, // G major chord (G-B-D)
        { note: 'B', octave: 3, duration: '1n', beat: 5 }, // G major chord (G-B-D)
        { note: 'D', octave: 3, duration: '1n', beat: 5 }, // G major chord (G-B-D)

        // Measure 3
        { note: 'C', octave: 3, duration: '1n', beat: 9 }, // C major chord (C-E-G)
        { note: 'E', octave: 3, duration: '1n', beat: 9 }, // C major chord (C-E-G)
        { note: 'G', octave: 3, duration: '1n', beat: 9 }, // C major chord (C-E-G)

        // Measure 4
        { note: 'G', octave: 3, duration: '1n', beat: 13 }, // G major chord (G-B-D)
        { note: 'B', octave: 3, duration: '1n', beat: 13 }, // G major chord (G-B-D)
        { note: 'D', octave: 3, duration: '1n', beat: 13 }, // G major chord (G-B-D)

        // Measure 5
        { note: 'F', octave: 3, duration: '1n', beat: 17 }, // F major chord (F-A-C)
        { note: 'A', octave: 3, duration: '1n', beat: 17 }, // F major chord (F-A-C)
        { note: 'C', octave: 3, duration: '1n', beat: 17 }, // F major chord (F-A-C)

        // Measure 6
        { note: 'C', octave: 3, duration: '1n', beat: 21 }, // C major chord (C-E-G)
        { note: 'E', octave: 3, duration: '1n', beat: 21 }, // C major chord (C-E-G)
        { note: 'G', octave: 3, duration: '1n', beat: 21 }, // C major chord (C-E-G)

        // Measure 7
        { note: 'G', octave: 3, duration: '1n', beat: 25 }, // G major chord (G-B-D)
        { note: 'B', octave: 3, duration: '1n', beat: 25 }, // G major chord (G-B-D)
        { note: 'D', octave: 3, duration: '1n', beat: 25 }, // G major chord (G-B-D)

        // Measure 8
        { note: 'C', octave: 3, duration: '1n', beat: 29 }, // C major chord (C-E-G)
        { note: 'E', octave: 3, duration: '1n', beat: 29 }, // C major chord (C-E-G)
        { note: 'G', octave: 3, duration: '1n', beat: 29 }, // C major chord (C-E-G)

    ],

    // 🎶 Right Hand (Melody - Treble Clef)
    rightHand: [
        // Measure 1
        { note: 'C', octave: 4, duration: '4n', beat: 1 },
        { note: 'C', octave: 4, duration: '4n', beat: 2 },
        { note: 'G', octave: 4, duration: '4n', beat: 3 },
        { note: 'G', octave: 4, duration: '4n', beat: 4 },

        // Measure 2
        { note: 'A', octave: 4, duration: '4n', beat: 5 },
        { note: 'A', octave: 4, duration: '4n', beat: 6 },
        { note: 'G', octave: 4, duration: '2n', beat: 7 },

        // Measure 3
        { note: 'F', octave: 4, duration: '4n', beat: 9 },
        { note: 'F', octave: 4, duration: '4n', beat: 10 },
        { note: 'E', octave: 4, duration: '4n', beat: 11 },
        { note: 'E', octave: 4, duration: '4n', beat: 12 },

        // Measure 4
        { note: 'D', octave: 4, duration: '4n', beat: 13 },
        { note: 'D', octave: 4, duration: '4n', beat: 14 },
        { note: 'C', octave: 4, duration: '2n', beat: 15 },

        // Measure 5
        { note: 'G', octave: 4, duration: '4n', beat: 17 },
        { note: 'G', octave: 4, duration: '4n', beat: 18 },
        { note: 'F', octave: 4, duration: '4n', beat: 19 },
        { note: 'F', octave: 4, duration: '4n', beat: 20 },

        // Measure 6
        { note: 'E', octave: 4, duration: '4n', beat: 21 },
        { note: 'E', octave: 4, duration: '4n', beat: 22 },
        { note: 'D', octave: 4, duration: '2n', beat: 23 },

        // Measure 7
        { note: 'G', octave: 4, duration: '4n', beat: 25 },
        { note: 'G', octave: 4, duration: '4n', beat: 26 },
        { note: 'F', octave: 4, duration: '4n', beat: 27 },
        { note: 'F', octave: 4, duration: '4n', beat: 28 },

        // Measure 8
        { note: 'E', octave: 4, duration: '4n', beat: 29 },
        { note: 'E', octave: 4, duration: '4n', beat: 30 },
        { note: 'D', octave: 4, duration: '2n', beat: 31 },
    ],
};

