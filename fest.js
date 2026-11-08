// fest.js - Dynamic Festival Fireworks & Particles
document.addEventListener('DOMContentLoaded', () => {
    // Agar pehle se canvas hai toh dobara mat banao
    if (document.getElementById('festival-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'festival-canvas';
    canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:-1;';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => { 
        w = canvas.width = window.innerWidth; 
        h = canvas.height = window.innerHeight; 
    });

    let particles = [];
    const colors = ['#ffd700', '#ff8c00', '#ff4500', '#ffffff', '#ff1493', '#00ffff'];

    class Firework {
        constructor(x, y, isClick = false) {
            this.x = x || Math.random() * w;
            this.y = isClick ? y : h; // Click pe wahi se start hoga, warna niche se
            this.targetY = isClick ? y : Math.random() * (h * 0.6); // Click pe wahi footega
            this.speed = Math.random() * 3 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.exploded = false;
            this.isClick = isClick;
        }
        update() {
            if (!this.exploded) {
                if (!this.isClick) {
                    this.y -= this.speed;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x, this.y + 10);
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
                // Agar upar pahunch gaya YA click hua hai toh footega
                if (this.y <= this.targetY || this.isClick) {
                    this.exploded = true;
                    this.createExplosion();
                }
            }
        }
        createExplosion() {
            // Click patakhe me thode zyada sparks honge
            const sparkCount = this.isClick ? Math.floor(Math.random() * 40) + 40 : Math.floor(Math.random() * 30) + 30; 
            for (let i = 0; i < sparkCount; i++) {
                particles.push(new Spark(this.x, this.y, this.color, this.isClick));
            }
        }
    }

    class Spark {
        constructor(x, y, color, isClick = false) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            // Click wale patakhe thode zyada door tak jayenge
            const speed = isClick ? Math.random() * 8 + 2 : Math.random() * 5 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // Gravity
            this.vx *= 0.98; // Air resistance
            this.life -= this.decay;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${this.life})`;
            ctx.fill();
        }
        hexToRgb(hex) {
            if(hex === '#ffffff') return '255,255,255';
            let r = parseInt(hex.slice(1, 3), 16);
            let g = parseInt(hex.slice(3, 5), 16);
            let b = parseInt(hex.slice(5, 7), 16);
            return `${r},${g},${b}`;
        }
    }

    // 🎇 Click patakha logic
    window.addEventListener('click', (e) => {
        // Agar user kisi link ya button pe click kar raha hai, toh wahan patakha mat chalao (optional)
        // if (e.target.closest('a') || e.target.closest('button')) return;
        
        particles.push(new Firework(e.clientX, e.clientY, true));
    });

    function animate() {
        // Trail effect (Purana frame halka sa fade karega)
        ctx.fillStyle = 'rgba(10, 5, 0, 0.15)'; 
        ctx.fillRect(0, 0, w, h);
        
        // Random patakhe background me
        if (Math.random() < 0.04 && particles.length < 500) { 
            particles.push(new Firework(null, null, false));
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life !== undefined && particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
});