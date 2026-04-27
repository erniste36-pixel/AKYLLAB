import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contacts() {
  return (
    <div className="animate-fade-in" style={{ padding: '4rem 1rem', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>Свяжитесь с нами</h1>
      
      <div className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Остались вопросы? Хотите внедрить платформу Akyllab в вашей школе? Напишите нам!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <Mail color="var(--primary)" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>Email</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>info@akyllab.ai</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <Phone color="var(--secondary)" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>Телефон</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>+7 (777) 000-0000</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <MapPin color="#10b981" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>Адрес</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Алматы, Казахстан</p>
            </div>
          </div>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }} onSubmit={e => e.preventDefault()}>
          <input type="text" placeholder="Ваше Имя" required />
          <input type="email" placeholder="Ваш Email" required />
          <textarea 
            placeholder="Ваше Сообщение" 
            rows="5" 
            required
            style={{ 
              width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', 
              background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', 
              color: 'white', fontFamily: 'var(--font-sans)', marginBottom: '1rem' 
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Отправить сообщение</button>
        </form>
      </div>
    </div>
  );
}
