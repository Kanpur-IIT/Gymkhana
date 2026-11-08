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
    // Colors ko badal sakte ho (Abhi ke liye Diwali/Generic festive colors hain)
    const colors = ['#ffd700', '#ff8c00', '#ff4500', '#ffffff', '#ff1493', '#00ffff'];

    class Firework {
        constructor() {
            this.x = Math.random() * w;
            this.y = h; // Niche se start
            this.targetY = Math.random() * (h * 0.6); // Upar aadhe hisse tak
            this.speed = Math.random() * 3 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.exploded = false;
        }
        update() {
            if (!this.exploded) {
                this.y -= this.speed;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + 10);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                if (this.y <= this.targetY) {
                    this.exploded = true;
                    this.createExplosion();
                }
            }
        }
        createExplosion() {
            const sparkCount = Math.floor(Math.random() * 30) + 30; // 30-60 chhinte
            for (let i = 0; i < sparkCount; i++) {
                particles.push(new Spark(this.x, this.y, this.color));
            }
        }
    }

    class Spark {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // Gravity effect
            this.vx *= 0.98; // Air resistance
            this.life -= this.decay;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${this.life})`;
            ctx.fill();
        }
        hexToRgb(hex) {
            // Agar white hai toh direct return karo
            if(hex === '#ffffff') return '255,255,255';
            let r = parseInt(hex.slice(1, 3), 16);
            let g = parseInt(hex.slice(3, 5), 16);
            let b = parseInt(hex.slice(5, 7), 16);
            return `${r},${g},${b}`;
        }
    }

    function animate() {
        // Trail effect (Purana frame halka sa fade karega)
        ctx.fillStyle = 'rgba(10, 5, 0, 0.15)'; 
        ctx.fillRect(0, 0, w, h);
        
        // Random patakhe (agar particles 500 se kam hain)
        if (Math.random() < 0.04 && particles.length < 500) { 
            particles.push(new Firework());
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