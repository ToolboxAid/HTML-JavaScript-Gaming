// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// difficultyProfile.js

class DifficultyProfile {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static getWaveAsteroidCount(level = 1) {
        return this.clamp(3 + (level * 2), 5, 12);
    }

    static getAsteroidSpeedMultiplier(level = 1, size = 'large') {
        const waveBonus = this.clamp(1 + ((level - 1) * 0.06), 1, 1.45);

        switch (size) {
            case 'small':
                return waveBonus * 1.08;
            case 'medium':
                return waveBonus * 1.04;
            default:
                return waveBonus;
        }
    }

    static getUfoSpawnInterval(level = 1) {
        return this.clamp(25000 - ((level - 1) * 1500), 9000, 25000);
    }

    static getSmallUfoSpawnChance(level = 1) {
        return this.clamp(0.35 + ((level - 1) * 0.08), 0.35, 0.8);
    }

    static shouldSpawnSmallUfo(level = 1, randomValue = Math.random()) {
        return randomValue < this.getSmallUfoSpawnChance(level);
    }

    static getSmallUfoAimError(level = 1) {
        return this.clamp(18 - ((level - 1) * 2), 2, 18);
    }

    static getUfoFireInterval(level = 1, isSmall = false) {
        const baseInterval = isSmall ? 900 : 1200;
        const intervalReduction = (level - 1) * (isSmall ? 45 : 30);
        return this.clamp(baseInterval - intervalReduction, isSmall ? 350 : 500, baseInterval);
    }
}

export default DifficultyProfile;
