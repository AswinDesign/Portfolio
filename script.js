let menu = false
let value = false
let more = false

//page loader
window.addEventListener('load', () => {
    let preloader = document.getElementById('preloader');
    let progress = document.getElementById('progress');
    let body = document.getElementById('body');
    setTimeout(() => {
        preloader.style.display = "none";
        body.style.maxHeight = "fit-content";
        body.style.overflow = "scroll";
    }, 2000)



})




// for cursor
window.addEventListener("mousemove", (event) => {
    document.getElementById("cursor").style.opacity="1"
    document.getElementById("cursor1").style.opacity="1"

    let cursors = document.querySelectorAll(".cursor");
    let hovers = document.querySelectorAll(".mouse-hover")
    cursors.forEach((cursor) => {
        cursor.style.display = "";
        let x = event.pageX;
        let y = event.pageY;
        // cursor.style.position = "absolute"
        cursor.style.left = `${x}px`
        cursor.style.top = `${y}px`
        hovers.forEach((ele) => {
            ele.addEventListener('mouseover', () => {
                cursor.classList.add("hover")
            })
            ele.addEventListener('mouseleave', () => {
                cursor.classList.remove("hover")
            })
        })

    })

})

//for menu

function open_menu() {
    menu = !menu
    let ul = document.getElementById('menubar2')
    let icon = document.getElementById('menu_icon')
    let cross_icon = document.getElementById('menu_cross')
    let cursors = document.querySelectorAll(".cursor");
    document.getElementById("cursor").style.opacity="0"
    document.getElementById("cursor1").style.opacity="0"

    if (menu) {
        ul.style.width = "100%";
        ul.style.height = "100vh";
        ul.style.backdropFilter = "blur(10px)";
        icon.style.display = "none";
        cross_icon.style.display = "inline-block";
        cursors.forEach((cursor) => {
            cursor.classList.add("m-hover");
        })
    }
    else {
        ul.style.width = "0";
        ul.style.height = "0";
        icon.style.color = "aliceblue";
        icon.style.display = "inline-block";
        cross_icon.style.display = "none";
        cursors.forEach((cursor) => {
            cursor.classList.remove("m-hover");
        })
    }
    console.log(menu);
}
function close_menu(){
    menu = false
    let ul = document.getElementById('menubar2')
    let icon = document.getElementById('menu_icon')
    let cross_icon = document.getElementById('menu_cross')
    let cursors = document.querySelectorAll(".cursor");
    ul.style.width = "0";
        ul.style.height = "0";
        icon.style.color = "aliceblue";
        icon.style.display = "inline-block";
        cross_icon.style.display = "none";
        cursors.forEach((cursor) => {
            cursor.classList.remove("m-hover");
        })
}

// for title animation

// function titleanim() {
//     let title = document.getElementById('title')
//     title.style.transform = "scale(.8)"

// }

function view_skill() {

    let content = document.getElementById('content');
    let image = document.getElementById('image');
    let skill = document.getElementById('skill');
    let tools = document.getElementById('tools');
    let about = document.getElementById('about');
    let icon = document.getElementById('icon');
    value = !value
    if (value) {

        content.style.display = "none"
        image.style.display = "none"
        skill.style.display = "flex"
        tools.style.display = "flex"

        about.classList.add('border')
        icon.style.transform = "rotate(180deg)"

    }
    else {
        about.classList.remove('border')
        content.style.display = ""
        image.style.display = ""
        skill.style.display = "none"
        tools.style.display = "none"

        icon.style.transform = "rotate(0deg)"
    }

}

// more works

function showmore() {
    more = !more

    let workdone = document.getElementById('wokdone');
    let more_down1 = document.getElementById('more_down1');
    let more_up1 = document.getElementById('more_up1');
    let more_down2 = document.getElementById('more_down2');
    let more_up2 = document.getElementById('more_up2');
    let more_sec = document.getElementById('more');
    if (more) {
        workdone.style.height = "fit-content";
        more_down1.style.display = "none";
        more_up1.style.display = "inline-block";
        more_down2.style.display = "none";
        more_up2.style.display = "inline-block";
        more_sec.style.flexDirection = "column-reverse"
    } else {
        workdone.style.height = "var(--work-section-height)";
        more_down1.style.display = "inline-block";
        more_up1.style.display = "none";
        more_down2.style.display = "inline-block";
        more_up2.style.display = "none";
        more_sec.style.flexDirection = "column"
    }

}



// work animation
function check_viewport(element) {
    var rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function handleScroll() {
    var works = document.querySelectorAll('.each-work');
    let about = document.getElementById('about');
    let contacts = document.querySelectorAll('.each-media');
    works.forEach((work) => {
        if (check_viewport(work)) {
            work.classList.add('anim')
        }
        else {
            work.classList.remove('anim')
        }
    });

    contacts.forEach((contact) => {
        if (check_viewport(contact)) {
            contact.classList.add('contact-anim')
        }
        else {
            contact.classList.remove('contact-anim')
        }
    });


    if (check_viewport(about)) {
        about.classList.add('about-anim')
    }
    else {
        about.classList.remove('about-anim')
    }


}
handleScroll();



window.addEventListener('scroll', () => {

    let about = document.getElementById('about');
    let contacts = document.querySelectorAll('.each-media');
    let works = document.querySelectorAll('.each-work');



    //work animation
    works.forEach((work) => {
        if (check_viewport(work)) {
            work.classList.add('anim')
        }
        else {
            work.classList.remove('anim')
        }

    });

    //contact animation
    contacts.forEach((contact) => {
        if (check_viewport(contact)) {
            contact.classList.add('contact-anim')
        }
        else {
            contact.classList.remove('contact-anim')
        }
    });

    //about section animation
    if (window.scrollY >= 140) {
        about.classList.add('about-anim')
    }
    else {
        about.classList.remove('about-anim')
    }

    //cursor display
    document.getElementById("cursor").style.display = "none"
    document.getElementById("cursor1").style.display = "none"


    // header heighlight
    // let homeTitle = document.getElementById('homeTitle');
    // let homeAbout = document.getElementById('homeAbout')
    // let work = document.getElementById('work');
    // let contact = document.getElementById('contact')

    let is_homeTitle1 = document.getElementById('h_home1');
    let is_homeAbout1 = document.getElementById('h_about1');
    let is_work1 = document.getElementById('h_work1');
    let is_contact1 = document.getElementById('h_contact1');

    let is_homeTitle2 = document.getElementById('h_home2');
    let is_homeAbout2= document.getElementById('h_about2');
    let is_work2 = document.getElementById('h_work2');
    let is_contact2 = document.getElementById('h_contact2');
    // console.log("y=", window.scrollY);

    if (window.scrollY <= 240) {
        is_homeTitle1.classList.add('h-l-line')
        is_homeTitle2.classList.add('h-l-line')

        is_homeAbout1.classList.remove('h-l-line')
        is_work1.classList.remove('h-l-line')
        is_contact1.classList.remove('h-l-line')
        is_homeAbout2.classList.remove('h-l-line')
        is_work2.classList.remove('h-l-line')
        is_contact2.classList.remove('h-l-line')
    }
    else if (window.scrollY >= 240 && window.scrollY <= 860) {
        is_homeTitle1.classList.remove('h-l-line')
        is_work1.classList.remove('h-l-line')
        is_contact1.classList.remove('h-l-line')
        is_homeTitle2.classList.remove('h-l-line')
        is_work2.classList.remove('h-l-line')
        is_contact2.classList.remove('h-l-line')

        is_homeAbout1.classList.add('h-l-line')
        is_homeAbout2.classList.add('h-l-line')
    }
    else if (window.scrollY >= 860 && window.scrollY <= 1465) {
        is_homeTitle1.classList.remove('h-l-line')
        is_homeAbout1.classList.remove('h-l-line')
        is_contact1.classList.remove('h-l-line')
        is_homeTitle2.classList.remove('h-l-line')
        is_homeAbout2.classList.remove('h-l-line')
        is_contact2.classList.remove('h-l-line')

        is_work1.classList.add('h-l-line')
        is_work2.classList.add('h-l-line')
    }
    else if (window.scrollY >= 1465) {
        is_homeTitle1.classList.remove('h-l-line')
        is_homeAbout1.classList.remove('h-l-line')
        is_work1.classList.remove('h-l-line')
        is_homeTitle2.classList.remove('h-l-line')
        is_homeAbout2.classList.remove('h-l-line')
        is_work2.classList.remove('h-l-line')

        is_contact1.classList.add('h-l-line')
        is_contact2.classList.add('h-l-line')
    }
    else {

    }

});


