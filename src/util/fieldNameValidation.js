export const reservedFieldNames = [
    '__options',
    '__inertia',
    '__page',
    '__validateRequestType',
    'data',
    'delete',
    'errorFor',
    'errorsFor',
    'hasErrors',
    'initial',
    'onFail',
    'onSuccess',
    'patch',
    'post',
    'processing',
    'put',
    'reset',
    'submit',
    'successful',
    'withData',
    'withOptions',
];

export function guardAgainstReservedFieldName(fieldName) {
    if (reservedFieldNames.indexOf(fieldName) !== -1) {
        throw new Error(
            `Field name ${fieldName} isn't allowed to be used in a Form or Errors instance.`
        );
    }
}
