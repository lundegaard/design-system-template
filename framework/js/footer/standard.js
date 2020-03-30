class FooterStandard {
    constructor () {
        MiscEvent.addListener('overlay:show', this.show.bind(this));
        MiscEvent.addListener('overlay:hide', this.hide.bind(this));
        MiscEvent.addListener('menu:show', this.show.bind(this));
        MiscEvent.addListener('menu:hide', this.hide.bind(this));
        MiscEvent.addListener('loader:show', this.show.bind(this));
        MiscEvent.addListener('loader:hide', this.hide.bind(this));

        const backToTopElement = document.querySelector('#backToTop');
        if (backToTopElement) {
            MiscEvent.addListener('click', this.backToTop.bind(this), backToTopElement);
        }
    }

    show () {
        MiscAccessibility.hide(document.querySelector('footer'));
    }

    hide () {
        MiscAccessibility.show(document.querySelector('footer'));
    }

    backToTop (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop > 0) {
            MiscUtils.scrollTo(0)
        }
    }
}

// Singleton
new FooterStandard();
