/**
 * Used for circling and uncircling
 */
export class Circle {
    /**
     * Circles a letter / number
     * @param char - the character to circle
     * @returns the circled character
     */
    public static circle(char: string): string {
        // If it's zero
        if (char === '0')
            return String.fromCharCode(9450);

        // If the char is a number
        else if (!!+char)
            return String.fromCharCode(parseInt(char) + 9311);

        // If the char is upper-case
        else if (char === char.toUpperCase())
            return String.fromCharCode(char.charCodeAt(0) + 9333);

        // If the char is lower-case
        else if (char === char.toLowerCase())
            return String.fromCharCode(char.charCodeAt(0) + 9327);

        // It's none of them, so return nothing
        else
            return "";
    }

    /**
     * Uncircles a letter / number
     * @param char - the character to uncircle
     * @returns the uncircled character
     */
    public static uncircle(char: string): string {
        // Gets char code
        const charCode: number = char.charCodeAt(0);

        // If it's zero
        if (charCode === 9450)
            return '0';

        // If it's a number
        else if (charCode >= 9312 && charCode <= 9320)
            return "" + (charCode - 9311);

        // If it's upper-case
        else if (charCode >= 9398 && charCode <= 9423)
            return String.fromCharCode(charCode - 9333);

        // If it's lower-case
        else if (charCode >= 9424 && charCode <= 9449)
            return String.fromCharCode(charCode - 9327);

        // If it's none, return nothing
        else
            return "";
    }
}
