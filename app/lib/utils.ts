/**
 * Capitalizes the first letter of a string and makes the rest lowercase
 * @param str - The string to capitalize
 * @returns The capitalized string, or empty string if input is falsy
 */
export function capitalizeFirst(str: string | undefined | null): string {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

