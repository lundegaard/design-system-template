class FormFieldInputAbstract extends FormFieldAbstract {
    create (element) {
        super.create(element);

        const objectIndex = (this.objects.length - 1);
        const object = this.objects[objectIndex];

        object.textElement = element;
        object.valueElement = element;
        object.inputElements = [element];
        object.labelElement = MiscDom.getPreviousSibling(element, 'label');
        object.resetButtonElement = MiscDom.getNextSibling(element, '.ds44-reset');
    }

    initialize () {
        super.initialize();

        for (let objectIndex = 0; objectIndex < this.objects.length; objectIndex++) {
            const object = this.objects[objectIndex];

            MiscEvent.addListener('focus', this.focus.bind(this, objectIndex), object.textElement);
            MiscEvent.addListener('blur', this.blur.bind(this, objectIndex), object.textElement);
            MiscEvent.addListener('invalid', this.invalid.bind(this, objectIndex), object.textElement);
            MiscEvent.addListener('keyUp:*', this.write.bind(this, objectIndex));
            if (object.resetButtonElement) {
                MiscEvent.addListener('click', this.reset.bind(this, objectIndex), object.resetButtonElement);
            }
            if (object.labelElement) {
                MiscEvent.addListener('click', this.focusOnTextElement.bind(this, objectIndex), object.labelElement);
            }
            this.quit(objectIndex);
        }
    }

    write (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }
        if (object.textElement !== document.activeElement) {
            return;
        }

        this.showNotEmpty(objectIndex);
    }

    showNotEmpty (objectIndex) {
        super.showNotEmpty(objectIndex);

        this.showHideResetButton(objectIndex);
    }

    reset (objectIndex) {
        this.empty(objectIndex);

        this.focusOnTextElement(objectIndex);
    }

    enableElements (objectIndex, evt) {
        super.enableElements(objectIndex, evt);

        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.removeAttribute('readonly');
            inputElement.removeAttribute('aria-readonly');
        });
        if (object.labelElement && object.labelElement.closest('label')) {
            object.labelElement.closest('label').classList.remove('ds44-inputDisabled');
        }
    }

    disableElements (objectIndex, evt) {
        super.disableElements(objectIndex, evt);

        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.setAttribute('readonly', 'true');
            inputElement.setAttribute('aria-readonly', 'true');
        });
        if (object.labelElement && object.labelElement.closest('label')) {
            object.labelElement.closest('label').classList.add('ds44-inputDisabled');
        }

        this.blur(objectIndex);
        this.showHideResetButton(objectIndex);
    }

    showHideResetButton (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.resetButtonElement) {
            return;
        }

        if (!this.getText(objectIndex)) {
            // Hide reset button
            object.resetButtonElement.style.display = 'none';
        } else {
            // Hide reset button
            object.resetButtonElement.style.display = 'block';
        }
    }

    setData (objectIndex, data = null) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return;
        }

        let value = ((data && data.value) ? data.value : null);
        if (
            value &&
            typeof value === 'object'
        ) {
            value = JSON.stringify(value);
        }
        object.valueElement.value = value;
    }

    getData (objectIndex) {
        let data = super.getData(objectIndex);
        if (!data) {
            return null;
        }

        const object = this.objects[objectIndex];
        const extendedData = {};
        extendedData[object.name] = {
            'text': object.labelElement.innerText.replace(/\*$/, '')
        };

        return MiscUtils.merge(data, extendedData);
    }

    getText (objectIndex) {
        const object = this.objects[objectIndex];
        if (
            !object.textElement ||
            !object.textElement.value
        ) {
            return null;
        }

        return object.textElement.value;
    }

    isValid (inputElement) {
        let isValid = true;
        const validityStates = inputElement.validity;
        for (let key in validityStates) {
            if (!validityStates.hasOwnProperty(key)) {
                continue;
            }

            if (
                key !== 'valid' &&
                key !== 'valueMissing' &&
                validityStates[key]
            ) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    isEmpty (objectIndex) {
        const object = this.objects[objectIndex];

        let isEmpty = !this.getText(objectIndex);
        object.inputElements.forEach((inputElement) => {
            isEmpty = (isEmpty && this.isValid(inputElement));
        });
        return isEmpty;
    }

    focusOnTextElement (objectIndex) {
        const object = this.objects[objectIndex];

        MiscAccessibility.setFocus(object.inputElements[0]);
    }

    focus (objectIndex) {
        const object = this.objects[objectIndex];

        if (!object.isEnabled) {
            return;
        }

        this.enter(objectIndex);
    }

    blur (objectIndex) {
        if (!this.isEmpty(objectIndex)) {
            return;
        }

        this.quit(objectIndex);
    }

    getErrorMessage (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return super.getErrorMessage(objectIndex);
        }

        const data = this.getData(objectIndex);
        const autocomplete = object.textElement.getAttribute('autocomplete');
        if (!data || !autocomplete) {
            return super.getErrorMessage(objectIndex);
        }

        if (
            autocomplete === 'email' &&
            !MiscForm.isEmail(data[object.name].value)
        ) {
            return MiscTranslate._('FIELD_VALID_EMAIL_MESSAGE');
        }
        if (
            autocomplete === 'tel' &&
            !MiscForm.isPhone(data[object.name].value)
        ) {
            return MiscTranslate._('FIELD_VALID_PHONE_MESSAGE');
        }
        if (
            autocomplete === 'postal-code' &&
            !MiscForm.isPostcode(data[object.name].value)
        ) {
            return MiscTranslate._('FIELD_VALID_POSTCODE_MESSAGE');
        }

        return super.getErrorMessage(objectIndex);
    }

    checkFormat (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return true;
        }

        const data = this.getData(objectIndex);
        const autocomplete = object.textElement.getAttribute('autocomplete');
        if (!data || !autocomplete) {
            return true;
        }

        if (
            autocomplete === 'email' &&
            !MiscForm.isEmail(data[object.name].value)
        ) {
            return false;
        }
        if (
            autocomplete === 'tel' &&
            !MiscForm.isPhone(data[object.name].value)
        ) {
            return false;
        }
        if (
            autocomplete === 'postal-code' &&
            !MiscForm.isPostcode(data[object.name].value)
        ) {
            return false;
        }

        return true;
    }

    removeInvalid (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        let errorElement = object.containerElement.querySelector(':scope > .ds44-errorMsg-container');
        if (errorElement) {
            errorElement.innerHTML = '';
            errorElement.classList.add('hidden');
        }

        object.inputElements.forEach((inputElement) => {
            const defaultAriaDescribedBy = inputElement.getAttribute('data-bkp-aria-describedby');
            if (!defaultAriaDescribedBy) {
                inputElement.removeAttribute('aria-describedby');
            } else {
                inputElement.setAttribute('aria-describedby', defaultAriaDescribedBy);
            }
            inputElement.removeAttribute('aria-invalid');
        });
        object.textElement.classList.remove('ds44-error');

    }

    invalid (objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        const errorMessageElementId = MiscUtils.generateId();
        this.showErrorMessage(objectIndex, errorMessageElementId);

        object.inputElements.forEach((inputElement) => {
            const defaultAriaDescribedBy = inputElement.getAttribute('data-bkp-aria-describedby');
            if (!defaultAriaDescribedBy) {
                inputElement.setAttribute('aria-describedby', errorMessageElementId);
            } else {
                inputElement.setAttribute('aria-describedby', errorMessageElementId + ' ' + defaultAriaDescribedBy);
            }
            inputElement.setAttribute('aria-invalid', 'true');
        });
        object.textElement.classList.add('ds44-error');
    }
}
