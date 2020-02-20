class FormSelectStandard extends FormSelectAbstract {
    constructor() {
        const selects = [];
        document
            .querySelectorAll('.ds44-selectDisplay')
            .forEach((element) => {
                let formContainer = element.closest('.ds44-form__container');
                if (!formContainer) {
                    return;
                }

                if (
                    formContainer.querySelector('.ds44-select-container .ds44-select-list_elem input[type="radio"]') ||
                    formContainer.querySelector('.ds44-select-container .ds44-select-list_elem input[type="checkbox"]')
                ) {
                    return
                }

                // No radio button nor checkbox, this is a standard select
                selects.push(element);
            });

        super(
            selects,
            'selectStandard'
        );
    }

    create(element) {
        super.create(element);

        const objectIndex = (this.objects.length - 1);

        MiscEvent.addListener('keyPress:spacebar', this.selectOption.bind(this, objectIndex));
        MiscEvent.addListener('keyPress:enter', this.selectOption.bind(this, objectIndex));
    }

    selectOption(objectIndex, evt) {
        evt.preventDefault();

        const object = this.objects[objectIndex];
        if (!object.selectListElement) {
            return;
        }

        if (
            document.activeElement &&
            document.activeElement.classList.contains('ds44-select-list_elem') &&
            object.selectListElement.contains(document.activeElement)
        ) {
            MiscEvent.dispatch('mousedown', null, document.activeElement);
        }
    }

    getListItems(parentElement) {
        let previousItem = null;
        let nextItem = null;
        const selectedListItem = parentElement.querySelector('.ds44-select-list_elem:focus');
        if(selectedListItem) {
            previousItem = MiscDom.getPreviousSibling(selectedListItem.closest('.ds44-select-list_elem'));
            nextItem = MiscDom.getNextSibling(selectedListItem.closest('.ds44-select-list_elem'));
        }
        return {
            'first': parentElement.querySelector('.ds44-select-list_elem:first-child'),
            'selected': selectedListItem,
            'last': parentElement.querySelector('.ds44-select-list_elem:last-child'),
            'next': nextItem,
            'previous': previousItem
        };
    }

    select(objectIndex, evt) {
        evt.preventDefault();

        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }
        if (!object.selectListElement) {
            return;
        }

        const currentItem = evt.currentTarget.closest('.ds44-select-list_elem');
        const selectedListItem = object.selectListElement.querySelector('.selected_option');
        if (selectedListItem) {
            selectedListItem.classList.remove('selected_option');
            selectedListItem.removeAttribute('id');
            selectedListItem.removeAttribute('aria-selected');
            selectedListItem.removeAttribute('aria-checked');
        }
        currentItem.classList.add('selected_option');
        currentItem.setAttribute('aria-selected', 'true');
        currentItem.setAttribute('aria-checked', 'true');

        // Record click straight away as there is no validate button
        this.record(objectIndex);
    }

    getDomData(listElement) {
        return {
            'value': listElement.getAttribute('data-value'),
            'text': listElement.innerText
        };
    }
}

// Singleton
new FormSelectStandard();
