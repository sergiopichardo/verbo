/**
 * This function recursively searches for a nested property in an object.
 * 
 * @param objectToSearch - The object to search through.
 * @param targetPropertyName - The name of the property to find.
 * @returns The value of the found property, or undefined if not found.
 * 
 * How it works:
 * 1. It iterates through each property of the input object.
 * 2. If a property is itself an object, it recursively calls the function on that nested object.
 * 3. If the current property name matches the target, it returns the value.
 * 4. If the property isn't found in the current level or any nested levels, it returns undefined.
 * 
 * This allows for searching deeply nested objects without knowing the exact structure.
 */

export const findNestedProperty = (objectToSearch: any, targetPropertyName: string): any => {
    for (const currentPropertyName in objectToSearch) {
        const currentPropertyValue = objectToSearch[currentPropertyName];

        if (typeof currentPropertyValue === 'object' && currentPropertyValue !== null) {
            const nestedResult = findNestedProperty(currentPropertyValue, targetPropertyName);
            if (nestedResult !== undefined) {
                return nestedResult;
            }
        } else if (currentPropertyName === targetPropertyName) {
            return currentPropertyValue;
        }
    }
    return undefined;
};
