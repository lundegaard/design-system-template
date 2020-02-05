class Menu {
    constructor() {
        this.triggerMainMenuElement = null;
        this.triggerSubMenuElement = null;
        this.menu = null;

        this.hideMainListener = this.hideMain.bind(this);
        this.focusOutListener = this.focusOut.bind(this);
        this.clickOutListener = this.clickOut.bind(this);

        MiscEvent.addListener('keyUp:escape', this.hideMainListener);

        document
            .querySelectorAll('header .ds44-btn--menu')
            .forEach((element) => {
                MiscEvent.addListener('click', this.showMain.bind(this), element);
            });
        document
            .querySelectorAll('header .ds44-btnOverlay--closeOverlay')
            .forEach((element) => {
                MiscEvent.addListener('click', this.hideMainListener, element);
            });
        document
            .querySelectorAll('#ds44-btn-applis, header .ds44-navList .ds44-menuBtn')
            .forEach((element) => {
                MiscEvent.addListener('click', this.showSubMenu.bind(this), element);
            });
        document
            .querySelectorAll('header .ds44-btn-backOverlay')
            .forEach((element) => {
                MiscEvent.addListener('click', this.hideSubMenu.bind(this), element);
            });
    }

    showMain(evt) {
        if (evt) {
            evt.stopPropagation();
        }

        if (this.menu) {
            this.hideMain();
        }

        // Get corresponding menu
        const menu = document.querySelector('header .ds44-blocMenu');
        if (!menu) {
            return;
        }

        // Get menu main section
        const mainMenu = menu.querySelector('.ds44-overlay--navNiv1')
        if (!mainMenu) {
            return;
        }

        // Get corresponding close button
        const closeButton = menu.querySelector('.ds44-btnOverlay--closeOverlay');
        if (!closeButton) {
            return;
        }

        // Record the element that triggered the overlay
        this.triggerMainMenuElement = evt.currentTarget;
        this.menu = menu;

        // Show menu
        document.body.style.overflow = 'hidden';
        mainMenu.classList.add('show');
        mainMenu.setAttribute('aria-expanded', 'true');

        // Set focus in menu
        MiscAccessibility.setFocus(closeButton);

        MiscAccessibility.addFocusLoop(mainMenu);
        MiscEvent.dispatch('menu:show', {'element': mainMenu});

        MiscEvent.addListener('click', this.hideMainListener, closeButton);
        MiscEvent.addListener('focusout', this.focusOutListener, this.menu);
        MiscEvent.addListener('click', this.clickOutListener, document.body);
    }

    // Ferme tous les menus, et ajoute un focus sur le bouton qui a ouvert le dernier menu affiché
    hideMain(evt) {
        if (evt) {
            evt.stopPropagation();
        }

        // Get current menu
        if (!this.menu) {
            return;
        }

        // Get menu main section
        const mainMenu = this.menu.querySelector('.ds44-overlay--navNiv1')
        if (!mainMenu) {
            return;
        }

        // Get corresponding close button
        const closeButton = this.menu.querySelector('.ds44-btnOverlay--closeOverlay');
        if (!closeButton) {
            return;
        }

        MiscEvent.removeListener('click', this.hideMainListener, closeButton);
        MiscEvent.removeListener('focusout', this.focusOutListener, this.menu);
        MiscEvent.removeListener('click', this.clickOutListener, document.body);

        MiscAccessibility.removeFocusLoop();

        document.body.style.overflow = null;
        mainMenu.classList.remove('show');
        mainMenu.removeAttribute('aria-expanded');
        MiscAccessibility.show(mainMenu, true);
        document
            .querySelectorAll('header .ds44-blocMenu .ds44-overlay')
            .forEach((subMenu) => {
                subMenu.classList.remove('show');
                subMenu.removeAttribute('aria-expanded');
                MiscAccessibility.hide(subMenu, true);
            });

        if (this.triggerMainMenuElement) {
            MiscAccessibility.setFocus(this.triggerMainMenuElement)
        }

        this.triggerMainMenuElement = null;
        this.menu = null;

        MiscEvent.dispatch('menu:hide');
    }

    showSubMenu(evt) {
        // Get current menu
        if (!this.menu) {
            return;
        }

        // Get menu main section
        const mainMenu = this.menu.querySelector('.ds44-overlay--navNiv1');
        if (!mainMenu) {
            return;
        }

        let subMenu = null;
        if (evt.currentTarget.getAttribute('data-ssmenu')) {
            subMenu = document.querySelector('#' + evt.currentTarget.getAttribute('data-ssmenu'));
        } else {
            subMenu = document.querySelector('#navApplis');
        }
        if (!subMenu) {
            return;
        }

        // Get corresponding close button
        const backButton = subMenu.querySelector('.ds44-btn-backOverlay');
        if (!backButton) {
            return;
        }

        this.triggerSubMenuElement = evt.currentTarget;

        mainMenu.removeAttribute('aria-expanded');
        MiscAccessibility.hide(mainMenu, true);
        MiscAccessibility.removeFocusLoop();

        subMenu.setAttribute('aria-expanded', 'true');
        subMenu.classList.add('show');
        MiscAccessibility.show(subMenu, true);

        MiscAccessibility.setFocus(backButton);
        MiscAccessibility.addFocusLoop(subMenu);
    }

    hideSubMenu() {
        // Get current menu
        if (!this.menu) {
            return;
        }

        // Get menu main section
        const mainMenu = this.menu.querySelector('.ds44-overlay--navNiv1');
        if (!mainMenu) {
            return;
        }

        const subMenu = this.menu.querySelector('.ds44-overlay[aria-expanded="true"]');
        if (!subMenu) {
            return;
        }

        // Get corresponding close button
        const closeButton = mainMenu.querySelector('.ds44-btnOverlay--closeOverlay');
        if (!closeButton) {
            return;
        }

        subMenu.removeAttribute('aria-expanded');
        subMenu.classList.remove('show');
        MiscAccessibility.hide(subMenu, true);
        MiscAccessibility.removeFocusLoop();

        mainMenu.setAttribute('aria-expanded', 'true');
        MiscAccessibility.show(mainMenu, true);

        if (this.triggerSubMenuElement) {
            MiscAccessibility.setFocus(this.triggerSubMenuElement)
            this.triggerSubMenuElement = null;
        } else {
            MiscAccessibility.setFocus(closeButton);
        }
        MiscAccessibility.addFocusLoop(mainMenu);
    }

    focusOut(evt) {
        if (evt.target && this.menu.contains(evt.target)) {
            return;
        }

        MiscAccessibility.setFocus(this.menu);
    }

    clickOut(evt) {
        if (evt.target && this.menu.contains(evt.target)) {
            return;
        }

        this.hideMain();
    }
}

// Singleton
new Menu();
