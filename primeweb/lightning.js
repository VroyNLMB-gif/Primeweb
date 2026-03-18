// lightning.js: Custom Procedural Lightning Background for Primeweb

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('lightning-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Core parameters for drawing
    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // ---------------------------------------------------------
    // PROCEDURAL LIGHTNING GENERATOR
    // ---------------------------------------------------------
    
    // Arrays to store active lightning bolts
    let bolts = [];

    // Generates a jagged line segment between two points
    function createBolt(x1, y1, x2, y2, thickness) {
        let results = [];
        results.push({x: x1, y: y1});
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const totalDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Break the bolt into many small segments for sharp, jagged angles
        const numSegments = Math.max(10, Math.floor(totalDistance / 20)); 
        
        let cx = x1;
        let cy = y1;
        
        for (let i = 1; i <= numSegments; i++) {
            // How far along the main line we are
            const t = i / numSegments;
            
            // Base coordinate along the straight line
            const baseX = x1 + dx * t;
            const baseY = y1 + dy * t;
            
            // Add sharp perpendicular displacement (fractal noise)
            // Displacement scales with total distance, but goes to 0 at the ends
            const maxDisplacement = (totalDistance / 10) * Math.sin(t * Math.PI);
            
            // Generate a random sharp angle deviation
            const deviationX = (Math.random() - 0.5) * maxDisplacement;
            const deviationY = (Math.random() - 0.5) * maxDisplacement;
            
            let nextX = baseX + deviationX;
            let nextY = baseY + deviationY;
            
            // The final point must exact hit the destination
            if (i === numSegments) {
                nextX = x2;
                nextY = y2;
            }
            
            results.push({x: nextX, y: nextY});
            cx = nextX;
            cy = nextY;
        }
        
        return { path: results, thickness: thickness, alpha: 1.0 };
    }

    // Recursively generates branches off a main bolt
    function generateBranches(mainPath, currentThickness) {
        if (currentThickness < 0.8) return; // Stop branching when bolts get too thin
        
        for (let i = 2; i < mainPath.length - 2; i++) {
            // Realistic Lightning: Very low chance to branch, but when it does it's sharp
            if (Math.random() < 0.12) {
                const point = mainPath[i];
                
                // Sharp branches (between 30 and 70 degrees outward from vertical)
                const angleDeviation = (Math.random() * 0.7 + 0.3) * (Math.random() > 0.5 ? 1 : -1);
                // Assume downward is PI/2
                const angle = (Math.PI / 2) + angleDeviation; 
                
                // Branches are usually shorter than the main trunk
                const length = Math.random() * 250 + 50; 
                
                const endX = point.x + Math.cos(angle) * length;
                const endY = point.y + Math.sin(angle) * length;
                
                // Branches are thinner
                const branchThickness = currentThickness * (0.5 + Math.random() * 0.3);
                
                const branchBolt = createBolt(point.x, point.y, endX, endY, branchThickness);
                bolts.push(branchBolt);
                
                // Recursively branch off this branch (very rarely goes more than 2-3 deep)
                generateBranches(branchBolt.path, branchThickness);
            }
        }
    }

    // ---------------------------------------------------------
    // ANIMATION & TIMING LOOP
    // ---------------------------------------------------------
    
    let flashOpacity = 0;

    // The main render loop handles fading the canvas and rendering flashes
    function animate() {
        // Slowly clear the canvas with pure black to match the new background
        // Extremely low opacity (0.1) creates a nice lingering "glow" trace
        ctx.fillStyle = `rgba(3, 3, 3, 0.18)`; 
        ctx.shadowBlur = 0;
        ctx.fillRect(0, 0, width, height);

        // Render global thunder flash if active
        if (flashOpacity > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
            ctx.fillRect(0, 0, width, height);
            flashOpacity *= 0.85; // Exponential decay for realistic lightning flash
        } else {
            flashOpacity = 0;
        }

        // Draw and fade active bolts
        for (let i = bolts.length - 1; i >= 0; i--) {
            const bolt = bolts[i];
            
            ctx.beginPath();
            ctx.moveTo(bolt.path[0].x, bolt.path[0].y);
            
            for (let j = 1; j < bolt.path.length; j++) {
                ctx.lineTo(bolt.path[j].x, bolt.path[j].y);
            }
            
            // Bright white core, electric blue glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
            ctx.lineWidth = bolt.thickness;
            ctx.shadowBlur = bolt.thickness * 4;
            ctx.shadowColor = `rgba(96, 165, 250, ${bolt.alpha})`; 
            ctx.stroke();
            
            // Fade bolt out quickly
            bolt.alpha -= 0.05;
            
            // Remove dead bolts
            if (bolt.alpha <= 0) {
                bolts.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();

    // The trigger loop stochastically strikes lightning
    function triggerStrike() {
        // Determine strike points (usually top to bottom)
        const startX = width * (0.2 + Math.random() * 0.6); // Randomly across the top
        const startY = -50; // Slightly above canvas
        
        // Randomize realistic main bolt intensity (thicker cores)
        const thickness = Math.random() * 4 + 2; 
        
        // Generate the main trunk (stretching drastically far, highly angled)
        const endX = startX + (Math.random() - 0.5) * (width * 0.8);
        const endY = height + 100;
        
        const mainBolt = createBolt(startX, startY, endX, endY, thickness);
        bolts.push(mainBolt);
        
        // Generate procedural branches
        generateBranches(mainBolt.path, thickness);
        
        // Trigger the bright sky flash (highly intense)
        flashOpacity = 0.7 + Math.random() * 0.3;
        
        // SLOWER, MORE PURPOSEFUL STRIKES (1.5s to 5s between storms)
        const nextStrikeMs = Math.random() * 3500 + 1500;
        
        // Sometimes create violent double-strikes (flickering re-strikes along a similar path)
        if (Math.random() > 0.5) {
            setTimeout(() => {
                // The re-strike uses a slightly jittered target but similar path
                const secondaryBolt = createBolt(startX + (Math.random()-0.5)*10, startY, endX + (Math.random()-0.5)*50, endY, thickness * 0.6);
                bolts.push(secondaryBolt);
                generateBranches(secondaryBolt.path, thickness * 0.6);
                flashOpacity = Math.random() * 0.6 + 0.2;
            }, 60 + Math.random() * 120);
            
            // Rare Triple strike completely lighting up the sky
            if (Math.random() > 0.7) {
                 setTimeout(() => {
                    flashOpacity = 1.0;
                 }, 180 + Math.random() * 80);
            }
        }

        setTimeout(triggerStrike, nextStrikeMs);
    }

    // Start the storm!
    // Initialize after a small delay so the user sees the page load first
    setTimeout(triggerStrike, 1500);

});
