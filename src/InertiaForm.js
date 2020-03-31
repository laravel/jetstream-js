import { guardAgainstReservedFieldName, isArray, isFile, merge, objectToFormData } from './util';

class InertiaForm {
    constructor(data = {}, options = {}) {
        this.processing = false;
        this.successful = false;

        this.withData(data)
            .withOptions(options)
    }

    static create(data = {}) {
        return new InertiaForm().withData(data);
    }

    withData(data) {
        if (isArray(data)) {
            data = data.reduce((carry, element) => {
                carry[element] = '';
                return carry;
            }, {});
        }

        this.setInitialValues(data);

        this.processing = false;
        this.successful = false;

        for (const field in data) {
            guardAgainstReservedFieldName(field);

            this[field] = data[field];
        }

        return this;
    }

    withOptions(options) {
        this.__options = {
            bag: 'default',
            resetOnSuccess: true,
        };

        if (options.hasOwnProperty('bag')) {
            this.__options.bag = options.bag;
        }

        if (options.hasOwnProperty('resetOnSuccess')) {
            this.__options.resetOnSuccess = options.resetOnSuccess;
        }

        return this;
    }

    data() {
        const data = {};

        for (const property in this.initial) {
            data[property] = this[property];
        }

        return data;
    }

    reset() {
        merge(this, this.initial);
    }

    setInitialValues(values) {
        this.initial = {};

        merge(this.initial, values);
    }

    post(url) {
        return this.submit('post', url);
    }

    put(url) {
        return this.submit('put', url);
    }

    patch(url) {
        return this.submit('patch', url);
    }

    delete(url) {
        return this.submit('delete', url);
    }

    submit(requestType, url) {
        this.__validateRequestType(requestType);

        this.processing = true;
        this.successful = false;

        return new Promise((resolve, reject) => {
            this.__http[requestType](
                url,
                this.hasFiles() ? objectToFormData(this.data()) : this.data()
            )
                .then(response => {
                    this.processing = false;
                    this.onSuccess(response.data);

                    resolve(response.data);
                })
                .catch(error => {
                    this.processing = false;
                    this.onFail(error);

                    reject(error);
                });
        });
    }

    hasFiles() {
        for (const property in this.initial) {
            if (this.hasFilesDeep(this[property])) {
                return true;
            }
        }

        return false;
    };

    hasFilesDeep(object) {
        if (object === null) {
            return false;
        }

        if (typeof object === 'object') {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (this.hasFilesDeep(object[key])) {
                        return true;
                    }
                }
            }
        }

        if (Array.isArray(object)) {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    return this.hasFilesDeep(object[key]);
                }
            }
        }

        return isFile(object);
    }

    onSuccess(data) {
        this.successful = true;

        if (this.__options.resetOnSuccess) {
            this.reset();
        }
    }

    onFail(error) {
        this.successful = false;
    }

    hasErrors(field) {
        return this.errors.has(field);
    }

    errorFor(field) {
        return this.errors.first(field);
    }

    errorsFor(field) {
        return this.errors.get(field);
    }

    __validateRequestType(requestType) {
        const requestTypes = ['get', 'post', 'put', 'patch', 'delete'];

        if (requestTypes.indexOf(requestType) === -1) {
            throw new Error(
                `\`${requestType}\` is not a valid request type, ` +
                    `must be one of: \`${requestTypes.join('`, `')}\`.`
            );
        }
    }
}

export default InertiaForm;
