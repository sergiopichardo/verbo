/**
 * Finds a nested property in an object.
 * @param objectToSearch - The object to search.
 * @param targetPropertyName - The name of the property to find.
 * @returns The value of the property if found, otherwise undefined.
 */
export const findNestedProperty = (objectToSearch: Record<string, any>, targetPropertyName: string): any | undefined => {
    // Iterate over the object's properties
    for (const [key, value] of Object.entries(objectToSearch)) {
        // Base case: found the target property
        if (key === targetPropertyName) {
            return value;
        }

        // Recursive case: the value is an object
        if (value && typeof value === 'object') {
            const result = findNestedProperty(value, targetPropertyName);

            // Found the property in a nested object
            if (result !== undefined) {
                return result;
            }
        }
    }

    // Property not found
    return undefined;
};
