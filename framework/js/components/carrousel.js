'use strict';

class Carrousel {

  prevSlideMessageStr = 'Voir le contenu précédent';
  nextSlideMessageStr = 'Voir le contenu suivant';

  constructor() {
    const allCarrousel = document.querySelectorAll(".swipper-carousel-wrap");

    if(allCarrousel != null) {
      allCarrousel.forEach((element, indexCarrousel) => {

        const nextEl = element.getElementsByClassName("swiper-button-next")[0];
        const innerTextNextEl = nextEl.getElementsByClassName("visually-hidden")[0];
        const prevEl = element.getElementsByClassName("swiper-button-prev")[0];
        const innerTextPrevEl = prevEl.getElementsByClassName("visually-hidden")[0];
        const swiper = element.getElementsByClassName("swiper-container")[0];
        const arrSlide = swiper.getElementsByClassName("swiper-slide");
        const nbrSlide = arrSlide.length;
        const wrapper = element.getElementsByClassName("swiper-wrapper")[0];
        let nbrMaxSlide = wrapper.classList.contains("grid-3-small-1") ? 3 : 4;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        nbrMaxSlide = screenWidth >= 768 ? nbrMaxSlide : 1;

        var swiperObj = new Swiper (swiper, {
          direction: 'horizontal',
          spaceBetween: screenWidth >= 768 ? 16 : 0,
          watchOverflow: true,
          navigation: {
            nextEl: nextEl,
            prevEl: prevEl,
          },
          slidesPerView: nbrMaxSlide,
          loop: screenWidth >= 768 ? (nbrSlide > nbrMaxSlide) : (nbrSlide > 1),
        });

        if(swiperObj.params.loop) {

          let title = element.previousElementSibling.querySelector(".h2-like");

          const titleCarrousel = title != null ? title.innerText : "Carrousel n°"+(indexCarrousel+1);

          const updatePrevAndNextSlideMessage = () => {

            let indexPrevEl = swiperObj.realIndex === 0 ? nbrSlide : swiperObj.realIndex;
            let indexNextEl = swiperObj.realIndex+2 > nbrSlide ? swiperObj.realIndex+2-nbrSlide : swiperObj.realIndex+2;

            let titlePrevEl = this.prevSlideMessageStr+" "+titleCarrousel+" - "+indexPrevEl+"/"+nbrSlide;
            let titleNextEl = this.nextSlideMessageStr+" "+titleCarrousel+" - "+indexNextEl+"/"+nbrSlide;

            prevEl.setAttribute("title", titlePrevEl);
            nextEl.setAttribute("title", titleNextEl);
            innerTextPrevEl.innerText = titlePrevEl;
            innerTextNextEl.innerText = titleNextEl;
          };

          updatePrevAndNextSlideMessage();

          const getIndexDerniereTuileVisible = () => {
            let nbrSlideWithDuplicated = arrSlide.length;

            let index = swiperObj.activeIndex+(nbrMaxSlide-1);
            if(swiperObj.activeIndex+(nbrMaxSlide-1) > nbrSlideWithDuplicated) {
               index = swiperObj.activeIndex+(nbrMaxSlide-1) - nbrSlideWithDuplicated;
            }
            return index;
          }

          this.updateVisibiliteTuiles(arrSlide, swiperObj.activeIndex, getIndexDerniereTuileVisible());

          for(var button of [nextEl, prevEl]) {
            button.classList.remove("swiper-button-disabled");
            button.removeAttribute("aria-label");
            button.removeAttribute("role");

            button.addEventListener("click", (event) => {

              //pour que la methode ait lieu apres swipper
              setTimeout(updatePrevAndNextSlideMessage, 5);
            });

          }

          prevEl.addEventListener("click", (event) => {

            let tuileActive = arrSlide[swiperObj.activeIndex];
            let titreTuileActive = tuileActive.querySelector(".ds44-card__title a[href]:not([disabled])");

            for(let tuile of arrSlide) {
              tuile.style.visibility = "visible";
            }
            //pour que la methode ait lieu apres l'animation de scroll
            setTimeout(() => {
              this.updateVisibiliteTuiles(arrSlide, swiperObj.activeIndex, getIndexDerniereTuileVisible());
              titreTuileActive.focus();
            }, 200);

          });

          nextEl.addEventListener("click", (event) => {

            let index = getIndexDerniereTuileVisible();

            let tuileActive = arrSlide[index];
            let titreTuileActive = tuileActive.querySelector(".ds44-card__title a[href]:not([disabled])");

            for(let tuile of arrSlide) {
              tuile.style.visibility = "visible";
            }
            //pour que la methode ait lieu apres l'animation de scroll
            setTimeout(() => {
              this.updateVisibiliteTuiles(arrSlide, swiperObj.activeIndex, getIndexDerniereTuileVisible());
              titreTuileActive.focus();
            }, 200);

          });

          prevEl.addEventListener("keypress", (event) => fusionneKeyPressedWithClicked(event));
          nextEl.addEventListener("keypress", (event) => fusionneKeyPressedWithClicked(event));

          prevEl.addEventListener("keydown", (event) => {
            if (
              event.key === "Tab" &&
              ! event.shiftKey
            ) {
              event.preventDefault();
              let titreTuileActive = arrSlide[swiperObj.activeIndex].querySelector(".ds44-card__title a[href]:not([disabled])");
              titreTuileActive.focus();
            }

            if (
              event.key === "Tab" &&
              event.shiftKey
            ) {
              event.preventDefault();
              let blockParentCarrousel = element.parentElement;
              let blockBeforeCarrousel = blockParentCarrousel.previousElementSibling;
              let allElementsFocusableBeforeCarrousel = blockBeforeCarrousel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              let lastElementFocusableBeforeCarrousel = allElementsFocusableBeforeCarrousel[allElementsFocusableBeforeCarrousel.length-1];
              lastElementFocusableBeforeCarrousel.focus();
            }
          });

          nextEl.addEventListener("keydown", (event) => {
            if (
              event.key === "Tab" &&
              event.shiftKey
            ) {
              event.preventDefault();
              let titreTuileActive = arrSlide[getIndexDerniereTuileVisible()].querySelector(".ds44-card__title a[href]:not([disabled])");
              titreTuileActive.focus();
            }
          });

          for(let tuile of arrSlide) {
            var focusable = tuile.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            var firstFocusable = focusable[0];
            firstFocusable.addEventListener("keydown", (event) => {
              if (
                tuile === arrSlide[swiperObj.activeIndex] &&
                event.key === "Tab" &&
                event.shiftKey
              ) {
                event.preventDefault();
                prevEl.focus();
              }
            });
            var lastFocusable = focusable[focusable.length - 1];
            firstFocusable.addEventListener("keydown", (event) => {
              if (
                tuile === arrSlide[getIndexDerniereTuileVisible()] &&
                event.key === "Tab" &&
                ! event.shiftKey
              ) {
                event.preventDefault();
                nextEl.focus();
              }
            });
          }

        } else {

          disableAllTabIndexes(element);
          let index = 0
          for(let slide of arrSlide) {
            slide.querySelector(".ds44-card__title a[href]:not([disabled])").setAttribute("tabindex", index);
            index++;
          }

        }
        let spanNotif = element.getElementsByClassName("swiper-notification")[0];
        //pour que la methode ait lieu apres swipper
        setTimeout(spanNotif.remove(), 5);

      });
    }

    // besoin de garder les classes pour l'initialisation des caroussel avec js, donc on les enleve qu'a la fin
    this.removeAffichageSansJs();
  }

  updateVisibiliteTuiles(arrSlide, indexPremiereTuileVisible, indexDerniereTuileVisible) {

    if(indexDerniereTuileVisible > indexPremiereTuileVisible) {
      let index = 0
      for(let slide of arrSlide) {
        if (
          index >= indexPremiereTuileVisible &&
          index <= indexDerniereTuileVisible
        ) {
          slide.removeAttribute("aria-hidden");
          slide.style.visibility= "visible";
        } else {
          slide.setAttribute("aria-hidden", "true");
          slide.style.visibility= "hidden";
        }
        index++;
      }
    } else {
      let index = 0
      for(let slide of arrSlide) {
        if (
            (
              index >= indexPremiereTuileVisible &&
              index < arrSlide.length
            ) ||
            (
              index <= indexDerniereTuileVisible &&
              index >= 0
            )
        ) {
          slide.removeAttribute("aria-hidden");
          slide.removeAttribute("style");
        } else {
          slide.setAttribute("aria-hidden", "true");
          slide.setAttribute("style", "display:none;");
        }
        index++;
      }
    }
  }

  // enleve les classes css de l'affichage sans js
  removeAffichageSansJs() {
    const allWrapper = document.getElementsByClassName("swiper-wrapper");
    for(let wrapper of allWrapper){
      wrapper.classList.remove("ds44-carousel-swiper");
      wrapper.classList.remove("grid-4-small-1");
      wrapper.classList.remove("grid-3-small-1");
    }
  }

}

// Singleton
new Carrousel();
