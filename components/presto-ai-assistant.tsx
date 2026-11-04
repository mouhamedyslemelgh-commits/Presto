'use client';

import {useState, type FormEvent} from 'react';
import {Bot, Send, X, LoaderCircle, ShieldCheck} from 'lucide-react';
import {prestoCloud} from '../lib/presto-cloud';
import {useLanguage} from './presto-language';
import './presto-ai-assistant.css';

type Message = {role: 'user' | 'assistant'; text: string};

export default function PrestoAiAssistant() {
  const {language} = useLanguage();
  const ar = language === 'ar';
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || busy) return;
    setQuestion('');
    setMessages(previous => [...previous, {role: 'user', text: value}]);
    setBusy(true);
    try {
      const {data} = await prestoCloud!.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw Error(ar ? 'سجّل الدخول أولًا.' : 'Connectez-vous avant de continuer.');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + token},
        body: JSON.stringify({question: value}),
        cache: 'no-store'
      });
      const result = await response.json() as {answer?: string; error?: string};
      if (!response.ok || !result.answer) throw Error(result.error || 'Service unavailable');
      setMessages(previous => [...previous, {role: 'assistant', text: result.answer!}]);
    } catch (error) {
      setMessages(previous => [...previous, {
        role: 'assistant',
        text: error instanceof Error ? error.message : (ar ? 'تعذر الاتصال بالمساعد.' : 'Assistant indisponible.')
      }]);
    } finally { setBusy(false); }
  };

  return <div className="presto-ai" dir={ar ? 'rtl' : 'ltr'}>
    {!open && <button type="button" className="presto-ai-launch" onClick={() => setOpen(true)}
      aria-label={ar ? 'فتح مساعد PRESTO' : "Ouvrir l'assistant PRESTO"}>
      <Bot size={23}/><span>{ar ? 'مساعد PRESTO' : 'Assistant PRESTO'}</span>
    </button>}
    {open && <section className="presto-ai-panel" aria-label={ar ? 'مساعد PRESTO الذكي' : 'Assistant PRESTO'}>
      <header className="presto-ai-header"><div><Bot size={23}/>
        <strong>{ar ? 'مساعد PRESTO الذكي' : 'Assistant IA PRESTO'}</strong></div>
        <button type="button" onClick={() => setOpen(false)} aria-label={ar ? 'إغلاق' : 'Fermer'}><X size={21}/></button>
      </header>
      <div className="presto-ai-trust"><ShieldCheck size={16}/>{ar
        ? 'الوصول مقصور على المديرين المعتمدين. وضع القراءة فقط.'
        : 'Administrateurs approuvés uniquement. Consultation sans modification.'}</div>
      <div className="presto-ai-messages" role="log" aria-live="polite">
        {messages.length === 0 && <p className="presto-ai-intro">{ar
          ? 'اسأل عن عدد السائقين أو المعدات أو وسائل الدفع. للبحث اكتب: الاسم: [اسم السائق].'
          : 'Posez une question sur les livreurs, équipements ou moyens de paiement. Recherche : name: [nom].'}</p>}
        {messages.map((message, index) => <p key={index} className={'presto-ai-message ' + message.role}>{message.text}</p>)}
        {busy && <p className="presto-ai-working"><LoaderCircle size={16} className="presto-ai-spinner"/> {ar ? 'جار التحليل...' : 'Analyse en cours...'}</p>}
      </div>
      <form className="presto-ai-input" onSubmit={send}>
        <input value={question} onChange={event => setQuestion(event.target.value)} maxLength={900}
          aria-label={ar ? 'اكتب سؤالك' : 'Votre question'}
          placeholder={ar ? 'كم عدد السائقين المسجلين؟' : 'Combien de livreurs ?'}/>
        <button type="submit" disabled={busy || !question.trim()} aria-label={ar ? 'إرسال' : 'Envoyer'}><Send size={18}/></button>
      </form>
    </section>}
  </div>;
}
