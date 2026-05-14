// Particles Module
export function initParticles() {
  const particleContainer = document.querySelector('.particles');
  if (!particleContainer) return;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${4 + Math.random() * 4}s`;
    particle.style.opacity = `${0.3 + Math.random() * 0.7}`;
    particleContainer.appendChild(particle);
  }
}