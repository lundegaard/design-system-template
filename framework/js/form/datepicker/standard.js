class FormDatepickerStandard extends FormFieldAbstract {
    constructor() {
        super('.ds44-datepicker__shape', 'datepicker');
    }

    create(element) {
        super.create(element);

        // Create corresponding hidden input to store the value
        let valueElement = document.createElement('input');
        valueElement.classList.add('ds44-input-value');
        valueElement.setAttribute('type', 'hidden');
        valueElement.setAttribute('aria-hidden', 'true');
        element.parentNode.insertBefore(valueElement, element);

        const objectIndex = (this.objects.length - 1);
        const object = this.objects[objectIndex];
        object.valueElement = valueElement;
        object.inputElements = element.querySelectorAll('input[type="number"]');
        object.isRequired = (element.getAttribute('data-required') === 'true');

        MiscEvent.addListener('click', this.focusIn.bind(this, objectIndex), object.labelElement);
        object.inputElements.forEach((inputElement) => {
            MiscEvent.addListener('focus', this.focus.bind(this, objectIndex), inputElement);
            MiscEvent.addListener('blur', this.blur.bind(this, objectIndex), inputElement);
        });
    }

    enable(objectIndex, evt) {
        // TODO
    }

    disable(objectIndex) {
        // TODO
    }

    getData(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return null;
        }

        if (!object.valueElement.value) {
            return null;
        }

        let data = {};
        data[object.name] = object.valueElement.value;

        return data;
    }

    focusIn(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.inputElements[0]) {
            return;
        }

        MiscAccessibility.setFocus(object.inputElements[0]);
    }

    focus(objectIndex) {
        super.focus(objectIndex);

        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        object.textElement.classList.add('show');
    }

    blur(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }
        if (!object.labelElement) {
            return;
        }

        const textValue = this.getTextValue(objectIndex);
        if (!textValue) {
            object.labelElement.classList.remove(this.mainClassName);
            object.textElement.classList.remove('show');
        }
    }

    record(objectIndex, evt) {
        if (evt) {
            evt.preventDefault();
        }

        // TODO
    }

    checkValidity(objectIndex) {
        // TODO
    }

    invalid(objectIndex) {
        // TODO
    }

    getTextValue(objectIndex) {
        const object = this.objects[objectIndex];

        let textValue = null;
        object.inputElements.forEach((inputElement) => {
            if(inputElement.value) {
                textValue += inputElement.value;
            }
        });

        return textValue;
    }
}

// Singleton
new FormDatepickerStandard();
