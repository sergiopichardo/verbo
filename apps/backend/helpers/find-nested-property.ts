
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
