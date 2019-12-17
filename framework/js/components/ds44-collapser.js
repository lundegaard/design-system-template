// Détermine si une valeur est null ou undefined
function isNullOrUndefined(el) {
    return el == null || el == undefined || "null" == el || "undefined" == el;
}

// Ajoute la classe "show" sur un élément après un timer
function timerShow(elem, timer) {
    setTimeout(function() {
        elem.classList.add('show');
    }, timer);
}

// Ajoute le style css "display: none" sur un élément après un timer
function timerDisplayNone(elem, timer) {
    setTimeout(function() {
        elem.style.display = 'none';
    }, timer);
}

function timerClass(elem, className, value, timer) {
    setTimeout(function() {
        elem.style[className] = value;
    }, timer);
}

// Ferme tous les overlays, et ajoute un focus sur le bouton qui a ouvert le dernier overlay affiché
function performCloseOverlays(querySelector){
    document.querySelector("body").style.overflow = "initial";
    document.querySelector("header#top").setAttribute("aria-hidden", "false");
    let overlays = document.querySelectorAll(querySelector);
    overlays.forEach((overlay)=> {
        if (overlay.classList.contains("show")) {
            if ("nav1" == overlay.id) {
                document.querySelector(".ds44-btn--menu").focus();
            } else if (!isNullOrUndefined(overlay.closest("#nav1"))) {
                document.querySelector(".ds44-btn--menu").focus();
            } else {
                overlay.previousElementSibling.focus();
            }
        }
        overlay.classList.remove('show');
        overlay.setAttribute("aria-hidden", "true");
        // Ré-afficher tous les boutons "fermer"
        const allCloseButtons = document.querySelectorAll('.ds44-btnOverlay--closeOverlay');
        allCloseButtons.forEach((element) => {
          element.style.display = "block";
        });                                      
        timerDisplayNone(overlay,500);
    });

    let overlayBtns = document.querySelectorAll('.ds44-btn--menu, .ds44-overlay--navNiv1 .ds44-ds44-menuBtn');
    overlayBtns.forEach((btn)=> {
        btn.setAttribute("aria-expanded","false");
    });

    toggleMainHeaderFooterAriaHidden(null);
    document.querySelector("footer").setAttribute("aria-hidden","false");
}

// Cacher tous les boutons "Fermer" sauf le bouton de la modale actuelle
function hideCloseButtons(exceptionElem) {
    const allCloseButtons = document.querySelectorAll('.ds44-btnOverlay--closeOverlay');
    allCloseButtons.forEach((element) => {
        if (element != exceptionElem) {
            element.style.display = "none";
        } else {
            element.style.display = "block";
        }
    });
}

// Fonction qui va forcer le focus à faire une boucle sur un élément
// La seconde valeur en option permet de retirer le focus sur un autre élément
function trapFocus(element) {
    var focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    
    focusableEls.forEach((itFocusElem) => {
        itFocusElem.removeAttribute("tabindex");
    });
}

// Effectue les actions liées à la méthode toggleMainHeaderFooterAriaHidden
function performToggleAriaHidden(element, ariaHiddenValue, exceptionNode) {
    element.setAttribute("aria-hidden", ariaHiddenValue);
    var focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    if (ariaHiddenValue) {
        // le main est caché, on ajoute tabindex=-1 sur le main et ses sous-éléments interactifs
        element.setAttribute("tabindex", "-1");
        focusableEls.forEach((itFocusElem) => {
            if (!exceptionNode.contains(itFocusElem)) { // on ignore les éléments du bloc à exclure
                itFocusElem.setAttribute("oldtabindex", itFocusElem.getAttribute("tabindex"));
                itFocusElem.setAttribute("tabindex", "-1");
                itFocusElem.setAttribute("aria-hidden", "true");
            }
        });
    } else {
        // le main est affiché, on retire l'attribut tabindex sur le main et ses sous-éléments interactifs
        element.removeAttribute("tabindex");
        focusableEls.forEach((itFocusElem) => {
            if (isNullOrUndefined(itFocusElem.getAttribute("oldtabindex"))) {
                itFocusElem.removeAttribute("oldtabindex");
                itFocusElem.removeAttribute("tabindex");
            } else {
                itFocusElem.setAttribute("tabindex", itFocusElem.getAttribute("oldtabindex"));
                itFocusElem.removeAttribute("oldtabindex"); 
            }
            itFocusElem.removeAttribute("aria-hidden");
        });
    }
}

var isMenuOpened = false;

// Modifie la valeur de l'attribut "aria-hidden" de <main>, <header> et <footer>, et effectue des actions en fonction de sa valeur
function toggleMainHeaderFooterAriaHidden(exceptionNode) {
    let mainElem = document.querySelector("main");
    let headerElem = isMenuOpened ? document.querySelector("header .ds44-blocBandeau") : document.querySelector("header");
    let footerElem = document.querySelector("footer");
    let ariaHiddenValue = "false" == mainElem.getAttribute("aria-hidden") || isNullOrUndefined(mainElem.getAttribute("aria-hidden"));
    isMenuOpened = false;
    if (ariaHiddenValue && isNullOrUndefined(exceptionNode)) {
        return;
    }
    if (!isNullOrUndefined(mainElem)) {
        performToggleAriaHidden(mainElem, ariaHiddenValue, exceptionNode);
    }
    if (!isNullOrUndefined(headerElem)) {
        performToggleAriaHidden(headerElem, ariaHiddenValue, exceptionNode);
    }
    if (!isNullOrUndefined(footerElem)) {
        performToggleAriaHidden(footerElem, ariaHiddenValue, exceptionNode);
    }
}

// Modifie la valeur 'aria-hidden' des éléments section#menu section.ds44-overlay en 'true' sauf pour l'élément en paramètre
function toggleAriaHiddenSsMenu(exceptionElem) {
    let allSsMenuSections = document.querySelectorAll("section#menu section.ds44-overlay");

    allSsMenuSections.forEach((itSsMenu) => {
        if (itSsMenu == exceptionElem) {
            itSsMenu.setAttribute("aria-hidden", "false");
        } else {
            itSsMenu.setAttribute("aria-hidden", "true");
        }
    });
}

// Passe l'attribut "tabindex" des éléments 'focusables' d'un élément à -1
function disableAllTabIndexes(element) {
    var focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');

    focusableEls.forEach((itFocusElem) => {
        itFocusElem.setAttribute("tabindex", "-1");
    });
}

// Collapser ds44
(function (window) {
    function ds44() {
        var _ds44 = {};

        // composant menu de navigation - spécifique
        _ds44.menuExpand = function (querySelector) {

            const menuToggler = document.querySelectorAll(querySelector);

            menuToggler.forEach((element) => {
                element.addEventListener('click', () => {
                    displayMainNavMenu(element);
                })
            });

            let displayMainNavMenu = function (element) {
                timerClass(document.querySelector("body"), "overflow", "hidden", 375);
                document.querySelector("header#top > *:not(ds44-blocMenu)").setAttribute("aria-hidden", "true");
                element.setAttribute("aria-expanded","true");
                let navNivOne = document.querySelector('.ds44-overlay--navNiv1');
                isMenuOpened = true; // indiquer qu'on ouvre le menu
                toggleMainHeaderFooterAriaHidden(navNivOne);
                isMenuOpened = true; // duplicata pour qu'une fermeture d'overlay se souvienne que le menu est ouvert
                navNivOne.style.display = 'block';
                timerShow(navNivOne, 0);
                navNivOne.setAttribute("aria-hidden", "false");
                navNivOne.querySelector('.ds44-btnOverlay--closeOverlay').focus();
                document.getElementsByTagName("main")[0].setAttribute("aria-hidden","true");
                document.getElementsByTagName("footer")[0].setAttribute("aria-hidden","true");
                // ajouter l'élément de piège focus sur le menu nv1
                trapFocus(navNivOne);
                toggleAriaHiddenSsMenu(navNivOne);
            }
        }

        // Sous-composant expandable qui doit ouvrir son parent et fermer les autres expandables sur tabulation
        _ds44.ssElemExpandable = function (querySelector) {
            const toggler = document.querySelectorAll(querySelector);

            //Bind event on keydown (TAB, SHIFT+TAB)
            toggler.forEach((element) => {
                element.addEventListener('keyup', function (e) {
                    performTabFocus(e);
                });
            });

            let performTabFocus = function (e) {
                let KEYCODE_TAB = 9;
                var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

                if (!isTabPressed) { 
                    return;
                }
                var elemParent = e.target.closest('.ds44-collapser_element');
                if (!elemParent.querySelector('.ds44-collapser_button').classList.contains('show'))  {
                    elemParent.querySelector('.ds44-collapser_button').click();
                }
            }

        }

        // Composant expandable
        _ds44.expandable = function (querySelector) {
            const toggler = document.querySelectorAll(querySelector); // element(s) by id or class css
            let currentElementOpened = null;

            //Bind event on click
            toggler.forEach((element) => {
                element.addEventListener('click', () => {
                    showCurrentBlocExpandable(element);
                })
            });
            
            let showCurrentBlocExpandable = function (element) {
                const panel = element.nextElementSibling;
                currentElementOpened = element;
                element.classList.toggle('show');
                panel.style.maxHeight = (panel.style.maxHeight) ? null : panel.scrollHeight + 60 + "px";
                element.setAttribute('aria-expanded', element.classList.contains("show"));
                panel.setAttribute("aria-hidden", !element.classList.contains("show"));
                panel.style.visibility = element.classList.contains("show") ? "visible" : "hidden";
            }

        };

        // Composants expandables ouvrant un sous-menu en topbar
        _ds44.ssMenuExpandable = function (querySelector) {

            const ssMenuToggler = document.querySelectorAll(querySelector);

            ssMenuToggler.forEach((element) => {
                element.addEventListener('click', () => {
                    displaySsNavMenu(element);
                })
            });

            let displaySsNavMenu = function (element) {
                element.setAttribute("aria-expanded","true");
                let navNivTwo = document.querySelector("#" + element.getAttribute("data-ssmenu"));
                navNivTwo.style.display = 'block';
                timerShow(navNivTwo, 0);
                navNivTwo.setAttribute("aria-hidden", "false");
                hideCloseButtons(navNivTwo.querySelector('.ds44-btnOverlay--closeOverlay'));                                                                    
                navNivTwo.querySelector('.ds44-btn-backOverlay').focus();
                // ajouter l'élément de piège focus sur le menu nv2
                disableAllTabIndexes(document.querySelector("header"));
                trapFocus(navNivTwo);
                toggleAriaHiddenSsMenu(navNivTwo);
            }

        }

        // Composants "Retour" dans le menu en topbar
        _ds44.ssMenuReturn = function (querySelector) {

            const ssMenuReturn = document.querySelectorAll(querySelector);

            ssMenuReturn.forEach((element) => {
                element.addEventListener('click', () => {
                    returnSsNavMenu(element);
                })
            });

            let returnSsNavMenu = function (element) {
                let navNivOne = document.querySelector('.ds44-overlay--navNiv1');
                let navCurrent = element.closest("section.ds44-overlay");
                navCurrent.previousElementSibling.setAttribute("aria-expanded","false");
                navCurrent.setAttribute("aria-hidden", "true");
                navCurrent.style.display = 'block';
                navCurrent.classList.remove('show');
                hideCloseButtons(navNivOne.querySelector('.ds44-btnOverlay--closeOverlay'));
                navCurrent.previousElementSibling.focus();
                disableAllTabIndexes(document.querySelector("header"));
                trapFocus(navNivOne);
                toggleAriaHiddenSsMenu(navNivOne);
                timerDisplayNone(navCurrent,500);
            }

        }

        // Composant ouvrant le menu des applications
        _ds44.menuAppExpander = function (querySelector) {

            const ssMenuReturn = document.querySelectorAll(querySelector);

            ssMenuReturn.forEach((element) => {
                element.addEventListener('click', () => {
                    returnSsNavMenu(element);
                })
            });

            let returnSsNavMenu = function (element) {
                element.setAttribute("aria-expanded","true");
                let navNivOne = document.querySelector('.ds44-overlay--navNiv1');
                let navApplis = document.querySelector("#navApplis");
                navApplis.style.display = 'block';
                timerShow(navApplis, 0);
                navApplis.setAttribute("aria-hidden", "false");
                hideCloseButtons(navApplis.querySelector('.ds44-btnOverlay--closeOverlay'));
                navApplis.querySelector('.ds44-btnOverlay--closeOverlay').focus();
                // ajouter l'élément de piège focus sur le menu nv2
                disableAllTabIndexes(document.querySelector("header"));
                trapFocus(navApplis);
                toggleAriaHiddenSsMenu(document.querySelector(".ds44-overlay--navApplis"));
            }

        }

        // Composant popup
        _ds44.popup = function () {
            const modalComponents = document.querySelectorAll('[data-js="ds44-modal"]');

            //Bind les événements pour chacun des boutons
            modalComponents.forEach((button) => {
                button.addEventListener('click', () => {
                    const modalId = (button.dataset.target) ? button.dataset.target : null;
                    const modal = document.querySelector(modalId);
                    if (!isNullOrUndefined(modal)) {
                        toggleMainHeaderFooterAriaHidden(modal);
                        document.querySelector("main").setAttribute("aria-hidden","true");
                        _getFocusOnPopup(modal);
                        modal.style.display = "flex";
                        timerShow(modal, 1);
                        modal.setAttribute('aria-hidden', 'false');
                        modal.removeAttribute("tabindex");
                        disableAllTabIndexes(document.querySelector("section.ds44-ongletsContainer"));
                        trapFocus(modal);
                        const closeButton = modal.querySelector('[data-js="ds44-modal-action-close"]');
                        hideCloseButtons(closeButton);
                        closeButton.focus();
                        closeButton.addEventListener('click', () => {
                            _closePopup();
                        });

                        modal.addEventListener('click', (event) => {
                            if(modal == event.target){
                                _closePopup();
                            }
                        });
                    }
                })
            });

            //Bind événement lié au document ( bouton échap )
            window.document.addEventListener("keyup", (e) => {
                if (e.key === "Escape") {
                    _closePopup();
                    
                    const elementsShow = document.querySelectorAll('.show');
                    elementsShow.forEach((elementShow) => {
                        console.info('debug ' + elementsShow);
                        if (document.activeElement == elementShow) {
                            // hideAllOtherBlock();
                            elementShow.click();
                        }
                    });
                }
            });

            let _closePopup = function () {
                const currentModal = document.querySelector('.show[role="dialog"]');
                if (currentModal) {
                    toggleMainHeaderFooterAriaHidden(null);
                    currentModal.classList.toggle('show');
                    timerDisplayNone(currentModal, 300);
                    currentModal.setAttribute('aria-hidden', 'true');
                    if (currentModal.classList.contains("ds44-modal-container")) {
                        currentModal.setAttribute("tabindex", "-1");
                        document.querySelector('[data-js="ds44-modal"][data-target="#'+ currentModal.id +'"]').focus();
                    } else if (currentModal.classList.contains("ds44-overlay")) {
                        performCloseOverlays(".ds44-overlay");
                    }
                }

            }

            let _getFocusOnPopup = function (modal) {
                let firstField = modal.querySelector('input, button, textarea, a, select');
                let allFields = modal.querySelectorAll('input, button, textarea, a, select');
                let tabIndex = 1;

                firstField.focus();

                modal.addEventListener('focusout', dontAllowFocusOnOtherElements);

                function dontAllowFocusOnOtherElements(event) {
                    event.stopPropagation();

                    if (!modal.contains(event.relatedTarget) || event.relatedTarget == null) {
                        firstField.focus();
                        return false;
                    }
                    modal.focus();
                }
            }
        };

        _ds44.setFocus = function (selector, params) {
            document.getElementsByTagName('body')[0].classList.add('fullHeight');
            let elementToFocus = (typeof selector === "string") ? document.querySelector(selector) : selector;

            if (isNullOrUndefined(elementToFocus)) return;

            //Selon la configuration , on va autorisé le masquage du focus soit au click soit via le bouton échap
            if (params) {
                function escapeFunction(evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 27) {
                        deleteExistingFocus();
                        document.removeEventListener('keydown', escapeFunction);
                    }
                };
                document.addEventListener('keydown', escapeFunction);
            }

            //Pour ne pas effectuer un focus sur une des divs de focus
            if (elementToFocus.classList.contains('focus-background')) {
                return;
            }

            let offsetElement = getOffset(elementToFocus);

            deleteExistingFocus();

            function deleteExistingFocus() {
                let existingDiv = document.querySelectorAll('.focus-background');

                if (existingDiv.length) {
                    existingDiv.forEach((divToDelete) => {
                        divToDelete.parentNode.removeChild(divToDelete);
                    });
                    document.getElementsByTagName('body')[0].classList.remove('fullHeight');
                }

            }

            function getOffset(el) {
                var _x = 0;
                var _y = -el.clientTop;
                while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                    _x += el.offsetLeft - el.scrollLeft;
                    _y += el.offsetTop - el.scrollTop;
                    el = el.offsetParent;
                }
                return {top: _y - window.scrollY, left: _x - window.scrollX};
            }

            function createDiv(styles) {
                let newDiv = document.createElement("div");
                newDiv.classList.add("focus-background");
                styles = Object.keys(styles).reduce((acc, key) => {
                    acc[key] = styles[key] + 'px';
                    return acc;
                }, {});
                Object.assign(newDiv.style, styles);
                return newDiv;
            }

            const newDivLeft = createDiv({
                top: 0,
                bottom: 0,
                left: 0,
                width: offsetElement.left
            });

            const newDivTop = createDiv({
                top: 0,
                height: offsetElement.top,
                left: offsetElement.left,
                width: elementToFocus.offsetWidth
            });

            const newDivRight = createDiv({
                top: 0,
                bottom: 0,
                left: offsetElement.left + elementToFocus.offsetWidth,
                right: 0
            });

            const newDivBottom = createDiv({
                top: offsetElement.top + elementToFocus.offsetHeight,
                bottom: 0,
                left: offsetElement.left,
                width: elementToFocus.offsetWidth,
            });

            document.body.appendChild(newDivLeft);
            document.body.appendChild(newDivTop);
            document.body.appendChild(newDivRight);
            document.body.appendChild(newDivBottom);
        }

        _ds44.expandTuileLink = function() {
            /* Etend le lien dans les tuiles en ajoutant un onclick sur l'ensemble de la tuile */

            let allTuiles = document.querySelectorAll('section.ds44-card');

            if (allTuiles.length) {
                allTuiles.forEach((tuile) => {
                    tuile.onclick = function(e) {
                        tuileLinkArray = tuile.getElementsByTagName('a');
                        if (tuileLinkArray.length) {
                            tuileLinkArray[0].click();
                        }
                    };
                });
            }
        }

        _ds44.closeOverlays = function(querySelector){
            let closeBtns = document.querySelectorAll(querySelector);
            if (closeBtns.length){
                closeBtns.forEach((btn) => {
                    btn.onclick = function() {
                        performCloseOverlays(".ds44-overlay");
                    };
                });
            }
        }

        _ds44.fiddleInputLabel = function (classCSSAnimation, querySelector) {

                let allInputs = document.querySelectorAll(querySelector);

                if (allInputs.length) {
                    allInputs.forEach((inputElem) => {
                        const label = inputElem.previousElementSibling;

                        label.classList.remove(classCSSAnimation);

                        inputElem.addEventListener('focus', (event) => {
                            label.classList.add(classCSSAnimation);
                        });
                        inputElem.addEventListener('blur', (event) => {
                            if(! inputElem.value) {
                                label.classList.remove(classCSSAnimation);
                            }
                        });
                    });
                }
        }

        _ds44.transitionContenuOnglets = function (querySelector) {

                function processTransitionOnglets(target, onglets) {
                    if (onglets.length) {
                        onglets.forEach((itOnglet) => {

                            // est-ce que l'onglet cliqué correspond à l'onglet vérifié ?
                            if (target == itOnglet) {
                                // On affiche son contenu immédiatement
                                document.querySelector("#" + itOnglet.getAttribute("aria-controls")).style.display = "block";
                                timerClass(document.querySelector("#" + itOnglet.getAttribute("aria-controls")), "opacity", "1", 300);

                            } else {
                                // On cache son contenu avec un délai
                                timerClass(document.querySelector("#" + itOnglet.getAttribute("aria-controls")), "opacity", "0", 150);
                                timerDisplayNone(document.querySelector("#" + itOnglet.getAttribute("aria-controls")), 150);
                            }
                            
                        });
                    }
                }

                let allOnglets = document.querySelectorAll(querySelector);

                if (allOnglets.length) {
                    allOnglets.forEach((onglet) => {

                        onglet.addEventListener('click', (event) => {
                            let target = event.target;
                            processTransitionOnglets(target, allOnglets);
                        });
                    });
                }
        }

        _ds44.reactOnInvalidInput = function() {
            allInputs = document.querySelectorAll("input");

            if (allInputs.length) {
                allInputs.forEach((itInput) => {
                    itInput.addEventListener("invalid", function() {
                        itInput.setAttribute("aria-invalid", "true");
                    });
                    itInput.addEventListener("blur", function() {
                        itInput.setAttribute("aria-invalid", "false");
                        itInput.checkValidity();
                    });
                });
            }


        }

        return _ds44;
    }

// On rend accessible notre librairie
    if (typeof (window.ds44) === 'undefined') {
        window.ds44 = ds44();
    }
})(window); // Création de la closure en passant en paramètre le scope global

// Initialisation du composant bouton menu
ds44.menuExpand('.ds44-btn--menu');

// Initialisation des boutons menu ouvrant le niveau 2
//ds44.meuNiv2Expand('.ds44-overlay--navNiv1 .ds44-ds44-menuBtn');

//Initialisation des composants collapse
ds44.expandable('.ds44-collapser_button');
ds44.ssElemExpandable('.ds44-collapser_content--link');
ds44.ssMenuExpandable('nav[role="navigation"] .ds44-navList .ds44-menuBtn');
ds44.ssMenuReturn('.ds44-btn-backOverlay');
ds44.menuAppExpander('#ds44-btn-applis');
//Initialisation des composants de popup
/*
Utilisation :
sur un lien, ou boutton ou autre élément html , ajouter ces deux attributs :
data-js="ds44-modal" data-target="#ds44-modal-exemple"

data-js="ds44-modal" , permet de définir l'élément qui servira à afficher la popup lors d'un click
data-target="#ds44-modal-exemple" , permet de définir la popup, via un id ou une class css unique /!\
 */
ds44.popup();

/*
Utilisation du composant de mise en avant
indiquer le sélecteur en paramètre ( id/class )
le second paramètre permet d'activer le bouton echap
true ou false
*/
ds44.setFocus('#focusable', true);

//Démonstration sur l'événement click , met en avant l'élément sur lequel on a cliqué
/*
document.addEventListener('click', function (e) {

    e.preventDefault();
    let element = e.target;
    ds44.setFocus(element, true);

}, true);
*/

ds44.expandTuileLink();
// sert pour gérer les liens autour des tuiles

ds44.closeOverlays(".ds44-btnOverlay--closeOverlay");
// ajoute un listener aux boutons qui ferment les overlays

const classAnimInputForm = "ds44-moveLabel";

ds44.fiddleInputLabel(classAnimInputForm, '.'+classAnimInputForm+' + input[type="text"], .' + classAnimInputForm + ' + input[type="email"], .' + classAnimInputForm + ' + input[type="tel"], .' + classAnimInputForm + ' + input[type="search"]');
// faire une animation CSS sur certains champs inputs pour conserver un DOM lisible pour les lecteurs vocaux

ds44.transitionContenuOnglets(".js-tablist__link");
// effectuer une transition des display:none sur les contenus des onglets

ds44.reactOnInvalidInput();
// effectuer une action sur les champs "input" invalides