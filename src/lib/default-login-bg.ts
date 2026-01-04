export const defaultLoginBgCode = `
<style>
  .login-bg {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
    overflow: hidden;
    z-index: -1;
  }

  .login-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
  }

  .particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: float 15s infinite ease-in-out;
  }

  .particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 20s; }
  .particle:nth-child(2) { left: 20%; animation-delay: 2s; animation-duration: 18s; }
  .particle:nth-child(3) { left: 30%; animation-delay: 4s; animation-duration: 22s; }
  .particle:nth-child(4) { left: 40%; animation-delay: 1s; animation-duration: 19s; }
  .particle:nth-child(5) { left: 50%; animation-delay: 3s; animation-duration: 21s; }
  .particle:nth-child(6) { left: 60%; animation-delay: 5s; animation-duration: 17s; }
  .particle:nth-child(7) { left: 70%; animation-delay: 2s; animation-duration: 23s; }
  .particle:nth-child(8) { left: 80%; animation-delay: 4s; animation-duration: 16s; }
  .particle:nth-child(9) { left: 90%; animation-delay: 1s; animation-duration: 24s; }
  .particle:nth-child(10) { left: 15%; animation-delay: 3s; animation-duration: 20s; }
  .particle:nth-child(11) { left: 25%; animation-delay: 0s; animation-duration: 18s; }
  .particle:nth-child(12) { left: 35%; animation-delay: 2s; animation-duration: 22s; }
  .particle:nth-child(13) { left: 45%; animation-delay: 4s; animation-duration: 19s; }
  .particle:nth-child(14) { left: 55%; animation-delay: 1s; animation-duration: 21s; }
  .particle:nth-child(15) { left: 65%; animation-delay: 3s; animation-duration: 17s; }
  .particle:nth-child(16) { left: 75%; animation-delay: 5s; animation-duration: 23s; }
  .particle:nth-child(17) { left: 85%; animation-delay: 2s; animation-duration: 16s; }
  .particle:nth-child(18) { left: 95%; animation-delay: 4s; animation-duration: 24s; }
  .particle:nth-child(19) { left: 5%; animation-delay: 1s; animation-duration: 20s; }
  .particle:nth-child(20) { left: 50%; animation-delay: 0s; animation-duration: 25s; }

  @keyframes float {
    0%, 100% {
      transform: translateY(100vh) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) scale(1);
      opacity: 0;
    }
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }

  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }

  .glow-orb {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    filter: blur(80px);
    animation: orbFloat 10s ease-in-out infinite;
  }

  .glow-orb-1 {
    background: rgba(99, 102, 241, 0.3);
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .glow-orb-2 {
    background: rgba(139, 92, 246, 0.2);
    bottom: 20%;
    right: 10%;
    animation-delay: -5s;
  }

  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
  }
</style>

<div class="login-bg">
  <div class="grid-lines"></div>
  <div class="glow-orb glow-orb-1"></div>
  <div class="glow-orb glow-orb-2"></div>
  <div class="particles">
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>
</div>
`
