// script.js

// Make sure GSAP and ScrollTrigger are loaded before running animations
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);

    // Context for all animations to easily revert if needed
    let ctx = gsap.context(() => {

        // --- A. NAVBAR MORPH ---
        // Removed: Navbar is now a persistent pill.

        // --- B. HERO ENTRANCE ---
        const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        
        heroTimeline.to("#hero-pill", {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.1
        })
        .to(".hero-text h1", {
            y: 0,
            opacity: 1,
            duration: 1,
        }, "-=0.6")
        .to(".hero-text h2", {
            y: 0,
            opacity: 1,
            duration: 1.2,
        }, "-=0.6")
        .to("#hero-cta", {
            y: 0,
            opacity: 1,
            duration: 1,
        }, "-=0.8");


        // --- MAGNETIC BUTTONS HOMEMADE ---
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Scale value and translate
                gsap.to(btn, {
                    x: x * 0.2, // Adjust multiplier for stronger/weaker effect
                    y: y * 0.2,
                    scale: 1.03,
                    ease: "power2.out",
                    duration: 0.3
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    ease: "elastic.out(1, 0.3)",
                    duration: 0.8
                });
            });
        });


        // --- C. FEATURES ---

        // 1. Diagnostic Shuffler Card
        const shufflerContainer = document.querySelector('.shuffler-container');
        const shufflerData = [
            { bg: "bg-moss", fg: "text-cream", title: "Traffic Capture" },
            { bg: "bg-clay", fg: "text-cream", title: "Lead Generation" },
            { bg: "bg-cream", fg: "text-moss", border: "border border-moss/20", title: "Conversion Optimization" }
        ];

        let cardsHtml = '';
        shufflerData.forEach((data, index) => {
            cardsHtml += `
                <div class="shuffler-card ${data.bg} ${data.fg} ${data.border || ''}" data-index="${index}">
                    <h4 class="font-heading font-bold text-lg">${data.title}</h4>
                </div>
            `;
        });
        if(shufflerContainer) shufflerContainer.innerHTML = cardsHtml;

        const cards = Array.from(document.querySelectorAll('.shuffler-card'));
        
        function updateShuffler() {
            cards.forEach((card, index) => {
                const position = parseInt(card.dataset.index);
                // 0 is top, 1 is middle, 2 is bottom
                gsap.to(card, {
                    y: position * 15,
                    scale: 1 - (position * 0.05),
                    opacity: 1 - (position * 0.2),
                    zIndex: 10 - position,
                    duration: 0.8,
                    ease: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                });
            });
        }
        
        setTimeout(updateShuffler, 100); // init

        setInterval(() => {
            // Shift data index logically
            cards.forEach(card => {
                let currentIdx = parseInt(card.dataset.index);
                card.dataset.index = currentIdx === 2 ? 0 : currentIdx + 1;
            });
            updateShuffler();
        }, 3000);


        // 2. Telemetry Typewriter Card
        const typeData = [
            "> Initializing local scan...",
            "> Market intent analyzed.",
            "> 45 high-value targets found.",
            "> Deploying magnetic funnel...",
            "> Traffic flowing.",
            "> Lead captured: Contact form.",
            "> System awaiting next command."
        ];
        
        let typeIndex = 0;
        let charIndex = 0;
        const typeOutput = document.getElementById("typewriter-output");
        let currentLine = document.createElement('div');
        
        if(typeOutput) {
            typeOutput.appendChild(currentLine);
            
            function typeString() {
                if (charIndex < typeData[typeIndex].length) {
                    currentLine.innerHTML += typeData[typeIndex].charAt(charIndex);
                    charIndex++;
                    setTimeout(typeString, 50); // Typing speed
                } else {
                    setTimeout(() => {
                        // Move to next line
                        typeIndex++;
                        if (typeIndex >= typeData.length) typeIndex = 0; // loop
                        
                        // Scroll logic
                        if (typeOutput.childElementCount > 5) {
                            typeOutput.removeChild(typeOutput.firstChild);
                        }

                        currentLine = document.createElement('div');
                        currentLine.className = "mt-1";
                        typeOutput.appendChild(currentLine);
                        charIndex = 0;
                        typeString();
                    }, 1500); // Pause between lines
                }
            }
            setTimeout(typeString, 1000);
        }

        // 3. Cursor Protocol Scheduler
        const cursor = document.getElementById('demo-cursor');
        const targetCell = document.getElementById('target-cell');

        if(cursor && targetCell) {
            function animateCursor() {
                const tl = gsap.timeline({ delay: 1, repeat: -1, repeatDelay: 2 });
                
                tl.to(cursor, {
                    x: () => {
                        const tRect = targetCell.getBoundingClientRect();
                        const cRect = cursor.getBoundingClientRect();
                        const cx = gsap.getProperty(cursor, "x");
                        return tRect.left + (tRect.width / 2) - (cRect.left - cx) - 4;
                    },
                    y: () => {
                        const tRect = targetCell.getBoundingClientRect();
                        const cRect = cursor.getBoundingClientRect();
                        const cy = gsap.getProperty(cursor, "y");
                        return tRect.top + (tRect.height / 2) - (cRect.top - cy) - 4;
                    },
                    duration: 1.2,
                    ease: "power2.inOut"
                })
                .to(cursor, { scale: 0.8, duration: 0.1 }) // Click down
                .to(targetCell, { backgroundColor: "#CC5833", duration: 0.1 }, "<") // Highlight cell
                .to(cursor, { scale: 1, duration: 0.1 }) // Click up
                .to(cursor, { x: "+=30", y: "+=40", opacity: 0, duration: 0.8, ease: "power2.in" }) // Move away and fade
                .to(targetCell, { backgroundColor: "rgba(46, 64, 54, 0.05)", duration: 0.5 }, "+=1") // reset cell
                .set(cursor, { x: 0, y: 0, opacity: 1 }); // Reset cursor
            }
            
            // Run when in view to save resources
            ScrollTrigger.create({
                trigger: cursor.parentElement,
                start: "top 80%",
                once: true,
                onEnter: animateCursor
            });
        }


        // --- D. PHILOSOPHY ---
        gsap.to("#philosophy-bg img", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: "#philosophy",
                start: "top bottom", 
                end: "bottom top",
                scrub: true
            }
        });

        // Split text simulation (since we don't have paid SplitText plugin)
        const manifestoLines = document.querySelectorAll('.manifesto-line');
        manifestoLines.forEach((line) => {
            gsap.from(line, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: line,
                    start: "top 85%",
                }
            });
        });


        // --- E. PROTOCOL STACKING ---
        const protocolCards = gsap.utils.toArray('.protocol-card');
        
        protocolCards.forEach((card, i) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top top", 
                pin: true,
                pinSpacing: false, // critical for stacking
                id: "card-pin-" + i
            });

            // If it's not the last card, animate it scaling down as the next one covers it
            if(i !== protocolCards.length - 1) {
                gsap.to(card, {
                    scale: 0.9,
                    opacity: 0.5,
                    filter: "blur(10px)",
                    scrollTrigger: {
                        trigger: protocolCards[i+1], // Next card
                        start: "top bottom", // When next card's top hits bottom of viewport
                        end: "top top", // When next card's top reaches top
                        scrub: true
                    }
                });
            }
        });

        // --- NEW: FAQ ACCORDION LOGIC ---
        const faqButtons = document.querySelectorAll('.faq-btn');
        
        faqButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                const icon = btn.querySelector('i');
                const isExpanded = !content.classList.contains('hidden');

                // Close all other FAQs (optional, remove if you want multiple open)
                document.querySelectorAll('.faq-content').forEach(c => {
                    if (c !== content && !c.classList.contains('hidden')) {
                        c.classList.add('hidden');
                        c.previousElementSibling.querySelector('i').classList.replace('ph-minus', 'ph-plus');
                        c.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
                    }
                });

                // Toggle current FAQ
                if (isExpanded) {
                    content.classList.add('hidden');
                    icon.classList.replace('ph-minus', 'ph-plus');
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.remove('hidden');
                    icon.classList.replace('ph-plus', 'ph-minus');
                    // Add a slight rotation effect to the minus to make it pop
                    icon.style.transform = 'rotate(180deg)';
                    
                    // Simple GSAP fade-in for the content
                    gsap.fromTo(content, 
                        { opacity: 0, y: -10 },
                        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                    );
                }
            });
        });

        // --- NEW: MOBILE MENU TOGGLE ---
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        let menuOpen = false;

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                menuOpen = !menuOpen;
                if (menuOpen) {
                    mobileMenu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenu.classList.add('opacity-100', 'translate-y-0');
                    mobileMenuBtn.innerHTML = '<i class="ph ph-x text-2xl"></i>';
                } else {
                    mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                    mobileMenu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenuBtn.innerHTML = '<i class="ph ph-list text-2xl"></i>';
                }
            });

            // Close menu when a link is clicked
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    menuOpen = false;
                    mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                    mobileMenu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenuBtn.innerHTML = '<i class="ph ph-list text-2xl"></i>';
                });
            });
        }

    });

    // Cleanup isn't strictly necessary for a standard webpage unless React, 
    // but GSAP 3.11+ Context makes it easy if needed.
});

// --- NEW: PROJECT MODAL VIEWER LOGIC ---

function openProjectModal(url) {
    const modal = document.getElementById('project-modal');
    const iframe = document.getElementById('project-iframe');
    
    // Set the iframe source to the local file
    if(url !== '#') {
        iframe.src = url;
    }
    
    // Unhide the modal container
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Trigger a reflow before fading in
    void modal.offsetWidth;
    
    // Fade in
    modal.classList.remove('opacity-0');
    
    // Prevent the background body from scrolling while the modal is open
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const iframe = document.getElementById('project-iframe');
    
    // Fade out
    modal.classList.add('opacity-0');
    
    // Wait for the exact duration of the transition (300ms defined in tailwind class)
    setTimeout(() => {
        // Hide the container entirely
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Clear the iframe source so it doesn't keep running in the background
        iframe.src = '';
        
        // Restore background body scrolling
        document.body.style.overflow = '';
    }, 300);
}
