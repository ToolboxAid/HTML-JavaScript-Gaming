


/** Random
 * 
 */

class RandomUtils {

    static randomBoolean() {
        return RandomUtils.randomRange(0, 1, true);
    }

    static randomRange(min, max, isInteger = true) {
        const result = Math.random() * (max - min + (isInteger ? 1 : 0)) + min;
        return isInteger ? Math.floor(result) : result;
    }

}
export default RandomUtils;