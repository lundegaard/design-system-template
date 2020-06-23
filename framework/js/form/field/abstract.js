class FormFieldAbstract {
    constructor (selector, category) {
        this.category = category;
        this.objects = [];
        this.labelClassName = 'ds44-moveLabel';
        this.errorMessage = 'FIELD_MANDATORY_ERROR_MESSAGE';

        if (typeof selector === 'object') {
            // Elements passed as parameter, not text selector
            selector
                .forEach((element) => {
                    this.create(element);
                });
        } else {
            document
                .querySelectorAll(selector)
                .forEach((element) => {
                    this.create(element);
                });
        }
        this.initialize();
        this.fill();
    }

    create (element) {
        const object = {
            'id': MiscUtils.generateId(),
            'name': (element.getAttribute('name') || element.getAttribute('data-name')),
            'containerElement': (element.closest('.ds44-form__container') || element),
            'isRequired': (element.getAttribute('required') !== null || element.getAttribute('data-required') === 'true'),
            'isEnabled': !(element.getAttribute('readonly') !== null || element.getAttribute('disabled') !== null || element.getAttribute('data-disabled') === 'true')
        };
        object.position = this.getPosition(object.containerElement);
        element.removeAttribute('data-required');
        element.removeAttribute('data-disabled');

        const valuesAllowed = element.getAttribute('data-values');
        if (valuesAllowed) {
            object.valuesAllowed = JSON.parse(valuesAllowed);
        }

        this.objects.push(object);
    }

    initialize () {
        // Initialize each object
        for (let objectIndex = 0; objectIndex < this.objects.length; objectIndex++) {
            const object = this.objects[objectIndex];

            this.addBackupAttributes(objectIndex);

            MiscEvent.addListener('field:enable', this.enable.bind(this, objectIndex), object.containerElement);
            MiscEvent.addListener('field:disable', this.disable.bind(this, objectIndex), object.containerElement);
            MiscEvent.addListener('field:' + object.name + ':set', this.set.bind(this, objectIndex));
        }

        MiscEvent.addListener('form:validate', this.validate.bind(this));
    }

    fill () {
        // Get data from url and session storage
        const fieldParameters = window.sessionStorage.getItem('fields');
        let externalParameters = Object.assign(
            {},
            MiscUrl.getQueryParameters(),
            MiscUrl.getHashParameters(),
            (fieldParameters ? JSON.parse(fieldParameters) : {})
        );
        for (const fieldName in externalParameters) {
            if (!externalParameters.hasOwnProperty(fieldName)) {
                continue;
            }

            const fieldData = externalParameters[fieldName];
            if (
                fieldData.value &&
                fieldData.value.constructor === ({}).constructor
            ) {
                // Value is JSON => sub field
                externalParameters = Object.assign({}, externalParameters, fieldData.value);
            }
        }

        // Set each object
        for (let objectIndex = 0; objectIndex < this.objects.length; objectIndex++) {
            const object = this.objects[objectIndex];

            if (externalParameters[object.name]) {
                this.set(objectIndex, externalParameters[object.name]);
            }
        }
    }

    addBackupAttributes (objectIndex) {
        const object = this.objects[objectIndex];

        if (object.inputElements) {
            object.inputElements.forEach((inputElement) => {
                if (inputElement.getAttribute('aria-describedby')) {
                    inputElement.setAttribute(
                        'data-bkp-aria-describedby',
                        inputElement.getAttribute('aria-describedby')
                    );
                }
            });
        }
    }

    getPosition (currentContainerElement) {
        const containerElements = document.querySelectorAll('[class*="ds44-form_"][class*="_container"]')
        for (let i = 0; i < containerElements.length; i++) {
            if (containerElements[i] === currentContainerElement) {
                return i;
            }
        }

        return 999;
    }

    empty (objectIndex) {
        this.setData(objectIndex);
        this.showNotEmpty(objectIndex);
    }

    showNotEmpty (objectIndex) {
        this.enableDisableLinkedField(objectIndex);
    }

    set (objectIndex, data) {
        if (data instanceof Event) {
            data = data.detail;
        }

        this.setData(objectIndex, data);
        this.enter(objectIndex);
        this.showNotEmpty(objectIndex);
    }

    setData (objectIndex, data = null) {
        // Abstract method
    }

    getData (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return null;
        }

        if (!object.valueElement.value) {
            return null;
        }

        let dataValue = object.valueElement.value;
        try {
            dataValue = JSON.parse(dataValue);
        } catch (ex) {
        }
        let data = {};
        data[object.name] = {
            'value': dataValue,
            'position': object.position
        };

        return data;
    }

    enableDisableLinkedField (objectIndex) {
        const object = this.objects[objectIndex];

        const linkedFieldsContainerElement = object.containerElement.closest('.ds44-js-linked-fields');
        if (!linkedFieldsContainerElement) {
            return;
        }

        const secondLinkedFieldElement = MiscDom.getNextSibling(object.containerElement);
        if (
            !secondLinkedFieldElement ||
            secondLinkedFieldElement === object.containerElement
        ) {
            return;
        }

        // Has a linked field
        const areMaskedLinkedFields = !!object.containerElement.closest('.ds44-js-masked-fields');
        let data = this.getData(objectIndex);
        if (
            !data ||
            (
                data[object.name] &&
                data[object.name].metadata &&
                data[object.name].metadata.hasLinkedField === false
            )
        ) {
            // Disable linked field
            MiscEvent.dispatch(
                'field:disable',
                {
                    'areMaskedLinkedFields': areMaskedLinkedFields
                },
                secondLinkedFieldElement
            );
        } else {
            // Enabled linked field
            MiscEvent.dispatch(
                'field:enable',
                {
                    'data': data,
                    'areMaskedLinkedFields': areMaskedLinkedFields
                },
                secondLinkedFieldElement
            );
        }
    }

    enable (objectIndex, evt) {
        if (!this.isEnableAllowed(objectIndex, evt)) {
            this.disable(objectIndex, evt);

            return;
        }

        const object = this.objects[objectIndex];

        object.isEnabled = true;
        if (
            evt &&
            evt.detail &&
            evt.detail.data
        ) {
            object.parentValue = evt.detail.data[Object.keys(evt.detail.data)[0]].value;
        } else {
            object.parentValue = null;
        }

        if (!this.getData(objectIndex)) {
            this.empty(objectIndex);
        } else {
            this.enter(objectIndex);
        }
        this.showNotEmpty(objectIndex);
        this.enableElements(objectIndex, evt);
    }

    enableElements (objectIndex, evt) {
        if (
            evt &&
            evt.detail &&
            evt.detail.areMaskedLinkedFields
        ) {
            const object = this.objects[objectIndex];
            object.containerElement.classList.remove('hidden');
        }
    }

    disable (objectIndex, evt) {
        const object = this.objects[objectIndex];
        object.isEnabled = false;
        object.parentValue = null;

        this.empty(objectIndex);
        this.removeInvalid(objectIndex);
        this.disableElements(objectIndex, evt);
    }

    disableElements (objectIndex, evt) {
        if (
            evt &&
            evt.detail &&
            evt.detail.areMaskedLinkedFields
        ) {
            const object = this.objects[objectIndex];
            object.containerElement.classList.add('hidden');
        }
    }

    isEnableAllowed (objectIndex, evt) {
        const object = this.objects[objectIndex];
        if (!object.valuesAllowed) {
            return true;
        }

        if (
            !evt ||
            !evt.detail ||
            !evt.detail.data
        ) {
            return false;
        }

        let currentValues = evt.detail.data[Object.keys(evt.detail.data)[0]].value;
        if (typeof currentValues === 'object') {
            const valuesIntersection = (object.valuesAllowed.filter(value => currentValues.includes(value)));
            if (valuesIntersection.length === 0) {
                return false;
            }

            return true;
        }

        if (!object.valuesAllowed.includes(currentValues)) {
            return false;
        }

        return true;
    }

    enter (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.labelElement) {
            return;
        }

        if (!object.isEnabled) {
            return;
        }

        object.labelElement.classList.add(this.labelClassName);
    }

    quit (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.labelElement) {
            return;
        }

        object.labelElement.classList.remove(this.labelClassName);
    }

    validate (evt) {
        if (
            !evt ||
            !evt.detail ||
            !evt.detail.formElement
        ) {
            return;
        }

        let isValid = true;
        let data = {};
        for (let objectIndex = 0; objectIndex < this.objects.length; objectIndex++) {
            // Is the field in the form that is being validated
            if (!evt.detail.formElement.contains(this.objects[objectIndex].containerElement)) {
                continue;
            }

            // Don't validate a hidden field
            if (this.objects[objectIndex].containerElement.closest('.ds44-select-list_elem_child.hidden')) {
                continue;
            }

            if (
                (evt.detail.dryRun === true && !this.isValid(objectIndex)) ||
                (evt.detail.dryRun === false && !this.checkValidity(objectIndex))
            ) {
                isValid = false;
            } else if (
                evt.detail.formElement.classList.contains('ds44-listSelect') ||
                !this.objects[objectIndex].containerElement.closest('.ds44-select-list_elem_child')
            ) {
                // Don't take into consideration data from sub elements
                // The data is already injected in the parent value
                const newData = this.getData(objectIndex);
                if (newData) {
                    data = Object.assign(data, newData);
                }
            }
        }

        MiscEvent.dispatch(
            'form:validation',
            {
                'category': this.category,
                'isValid': isValid,
                'data': data
            },
            evt.detail.formElement
        );
    }

    removeInvalid (objectIndex) {
        const object = this.objects[objectIndex];

        const informationElement = object.containerElement.querySelector(':scope > .ds44-field-information');
        if (!informationElement) {
            return;
        }

        informationElement.classList.remove('ds44-error');
        const informationListElement = informationElement.querySelector('.ds44-field-information-list');
        if (informationListElement) {
            informationListElement
                .querySelectorAll('.ds44-field-information-error')
                .forEach((errorElement) => {
                    errorElement.remove();
                });
        }
    }

    checkFormat (objectIndex) {
        return true;
    }

    isValid (objectIndex) {
        const object = this.objects[objectIndex];
        if (
            (
                object.isRequired &&
                object.isEnabled &&
                !this.getData(objectIndex)
            ) ||
            !this.checkFormat(objectIndex)
        ) {
            return false;
        }

        return true;
    }

    checkValidity (objectIndex) {
        this.removeInvalid(objectIndex);

        if (!this.isValid(objectIndex)) {
            this.invalid(objectIndex);

            return false;
        }

        return true;
    }

    invalid (objectIndex) {
        // Abstract method
    }

    showErrorMessage (objectIndex, errorMessageElementId = null) {
        const object = this.objects[objectIndex];

        // Recreate information structure
        let informationElement = object.containerElement.querySelector(':scope > .ds44-field-information');
        if (!informationElement) {
            informationElement = document.createElement('div');
            informationElement.classList.add('ds44-field-information');
            informationElement.setAttribute('aria-live', 'polite');
            object.containerElement.appendChild(informationElement);
        }
        informationElement.classList.add('ds44-error');

        let informationListElement = informationElement.querySelector('.ds44-field-information-list');
        if (!informationListElement) {
            informationListElement = document.createElement('ul');
            informationListElement.classList.add('ds44-field-information-list');
            informationListElement.classList.add('ds44-list');
            informationElement.appendChild(informationListElement);
        } else {
            informationListElement
                .querySelectorAll('.ds44-field-information-error')
                .forEach((errorElement) => {
                    errorElement.remove();
                });
        }

        let errorMessageElement = document.createElement('li');
        if (errorMessageElementId) {
            errorMessageElement.setAttribute('id', errorMessageElementId);
        }
        errorMessageElement.classList.add('ds44-field-information-error');
        errorMessageElement.setAttribute('tabindex', '-1');
        informationListElement.appendChild(errorMessageElement);

        let errorIconElement = document.createElement('i');
        errorIconElement.classList.add('icon');
        errorIconElement.classList.add('icon-attention');
        errorIconElement.classList.add('icon--sizeM');
        errorIconElement.setAttribute('aria-hidden', 'true');
        errorMessageElement.appendChild(errorIconElement);

        let errorTextElement = document.createElement('span');
        errorTextElement.classList.add('ds44-iconInnerText');
        errorTextElement.innerHTML = this.getErrorMessage(objectIndex);
        errorMessageElement.appendChild(errorTextElement);
    }

    getErrorMessage (objectIndex) {
        return this.formatErrorMessage(objectIndex);
    }

    formatErrorMessage (objectIndex, errorMessage = this.errorMessage, patterns) {
        const object = this.objects[objectIndex];
        if (!object.labelElement) {
            return MiscTranslate._(errorMessage, patterns);
        }

        if (!patterns) {
            patterns = {};
        }
        if (!patterns.fieldName) {
            patterns.fieldName = object.labelElement.innerText.replace(/\*$/, '');
        }
        return MiscTranslate._(errorMessage, patterns);
    }
}
