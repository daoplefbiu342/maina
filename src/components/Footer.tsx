import { Trophy, Mail, Phone, MapPin, Instagram, Twitter, Youtube, Facebook, User } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" style={{ background: '#080f1e' }} className="text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-sm tracking-tight">FIFA FAN ACCESS</p>
                <p className="text-[10px] text-white/40 font-bold tracking-widest">WORLD CUP 2026</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              The official platform for exclusive FIFA World Cup 2026 fan experiences with the world's greatest footballers.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon className="w-4 h-4 text-white/60" />
                </button>
              ))}
            </div>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="font-black text-sm tracking-widest text-white/80 mb-4">EXPERIENCES</h4>
            <ul className="space-y-2.5">
              {['All Access VIP Card', 'Training Session Access', 'Fan Experience Ticket', 'Ronaldo Meet & Greet', 'Messi Meet & Greet', 'Stadium Tours'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo('experiences')}
                    className="text-white/50 text-sm hover:text-white transition-colors text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-sm tracking-widest text-white/80 mb-4">QUICK LINKS</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', action: () => scrollTo('about') },
                { label: 'FAQs', action: () => {} },
                { label: 'Terms & Conditions', action: () => {} },
                { label: 'Privacy Policy', action: () => {} },
                { label: 'Refund Policy', action: () => {} },
                { label: 'Admin Portal', action: () => onNavigate('admin') },
                { label: 'My Dashboard', action: () => onNavigate('dashboard') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button onClick={action} className="text-white/50 text-sm hover:text-white transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-sm tracking-widest text-white/80 mb-4">CONTACT US</h4>
            <div className="space-y-3">
              {[
                { icon: Mail, text: 'support@fifafanaccess.com' },
                { icon: Phone, text: '+1 (888) FIFA-2026' },
                { icon: MapPin, text: 'FIFA World Cup HQ\nNew York, USA 10001' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-white/50 text-sm whitespace-pre-line">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <p className="text-sky-400 text-xs font-bold mb-2">NEWSLETTER</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white placeholder-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button className="px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {['FIFA 2026', 'UEFA', 'CONMEBOL', 'Adidas', 'Visa'].map((p) => (
              <span key={p} className="text-white/25 font-black text-xs tracking-widest">{p}</span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/25 text-xs">Secured by</span>
            <span className="text-white/30 font-bold text-xs tracking-widest">SSL · PCI DSS</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/25">
          <span>© 2026 FIFA Fan Access. All rights reserved.</span>
          <span className="font-bold tracking-[0.3em]">UNITED · PASSION · FUTURE</span>
        </div>
      </div>
    </footer>
  );
}
