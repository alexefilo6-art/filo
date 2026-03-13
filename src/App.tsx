import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  googleProvider,
  auth,
  db 
} from './firebase';
import { 
  Coffee, 
  Plus, 
  LogOut, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  Send,
  Trash2,
  Edit3,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  createdAt: any;
  authorUid: string;
}

// --- Components ---

const Marquee = () => (
  <div className="bg-[#65c962] border-y-3 border-black py-3 overflow-hidden whitespace-nowrap relative">
    <div className="inline-block font-syne font-bold text-2xl uppercase animate-[scroll_20s_linear_infinite]">
      NESSUN GURU • RAGAZZI NORMALI CHE CI PROVANO • NO BULLSHIT • ZERO FUFFA MOTIVAZIONALE • NESSUN GURU • RAGAZZI NORMALI CHE CI PROVANO •&nbsp;
      NESSUN GURU • RAGAZZI NORMALI CHE CI PROVANO • NO BULLSHIT • ZERO FUFFA MOTIVAZIONALE • NESSUN GURU • RAGAZZI NORMALI CHE CI PROVANO •&nbsp;
    </div>
    <style>{`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
  </div>
);

export default function App() {
  const [view, setView] = useState<'landing' | 'blog' | 'admin' | 'article'>('landing');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newAuthor, setNewAuthor] = useState('Alex');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if admin (simple check for this demo, rules handle security)
        const isAdminEmail = u.email === 'filoamaducci@gmail.com';
        setIsAdmin(isAdminEmail);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Fetch articles
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubArticles = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => {
      unsubscribe();
      unsubArticles();
    };
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;

    try {
      await addDoc(collection(db, 'articles'), {
        title: newTitle,
        content: newContent,
        imageUrl: newImage,
        author: newAuthor,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });
      setNewTitle('');
      setNewContent('');
      setNewImage('');
      alert('Articolo pubblicato con successo!');
    } catch (error) {
      console.error("Error publishing: ", error);
      alert('Errore durante la pubblicazione.');
    }
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const renderLanding = () => (
    <div className="min-h-screen bg-white text-[#121212] font-inter selection:bg-[#65c962] selection:text-black">
      {/* Nav */}
      <nav className="flex justify-between items-center px-[5%] py-5 bg-white border-b-3 border-black sticky top-0 z-[1000]">
        <div className="font-syne text-3xl font-extrabold leading-[0.9] tracking-tighter">
          FAC<br /><span className="text-[#65c962] [-webkit-text-stroke:1px_black]">NEWSLETTER</span>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <a href="#argomenti" className="font-bold uppercase text-sm hover:underline decoration-3 decoration-[#65c962]">Di cosa parliamo</a>
          <a href="#processo" className="font-bold uppercase text-sm hover:underline decoration-3 decoration-[#65c962]">Dietro le quinte</a>
          <button 
            onClick={() => setView('blog')}
            className="bg-[#65c962] px-4 py-2 border-2 border-black font-bold uppercase text-sm shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all"
          >
            Guarda gli articoli!!
          </button>
          <a href="#iscriviti" className="bg-black text-white px-4 py-2 border-2 border-black font-bold uppercase text-sm hover:bg-[#65c962] hover:text-black transition-all">Iscriviti Ora</a>
        </div>
      </nav>

      <Marquee />

      {/* Hero */}
      <header className="grid md:grid-cols-2 items-center gap-12 max-w-7xl mx-auto mt-16 px-[5%]">
        <div className="space-y-6">
          <h1 className="font-syne text-5xl md:text-7xl font-bold leading-[0.9] uppercase">
            Piccole scelte,<br />grande <span className="bg-[#65c962] px-2 shadow-[4px_4px_0px_black]">vita.</span>
          </h1>
          <p className="text-lg font-semibold leading-relaxed">
            Nessuna verità in tasca. Siamo due ragazzi normali, incasinati, che cercano di migliorarsi un pezzo alla volta. Testiamo abitudini, leggiamo, sbagliamo e ti mandiamo una mail con quello che ha funzionato davvero.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#iscriviti" className="bg-black text-white px-8 py-4 font-bold uppercase shadow-[6px_6px_0px_black] hover:bg-[#65c962] hover:text-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">Voglio iscrivermi!</a>
            <button 
              onClick={() => setView('blog')}
              className="bg-[#65c962] text-black px-8 py-4 font-bold uppercase border-3 border-black shadow-[6px_6px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] transition-all"
            >
              Guarda gli articoli!!
            </button>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://r2.fivemanage.com/oOY8ibi8BXBZNBzGRWSs2/Screenshot2026-01-23184430.png" 
            alt="FAC Newsletter Cover"
            className="w-full border-3 border-black shadow-[6px_6px_0px_black] -rotate-2 hover:rotate-0 hover:scale-[1.02] transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Topics */}
      <section id="argomenti" className="max-w-7xl mx-auto my-24 px-[5%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { emoji: '🧠', title: 'Mindset', text: 'Meno paranoie, più lucidità. Strumenti per riordinare la testa quando sembra scoppiare.' },
            { emoji: '📅', title: 'Abitudini', text: 'Senza alzarsi alle 4 del mattino. Piccoli cambiamenti pratici per chi ha una vita normale.', bg: 'bg-[#effaf0]' },
            { emoji: '🧘', title: 'Zero Stress', text: 'Come tirare il freno a mano e sopravvivere alle aspettative (nostre e degli altri).' },
            { emoji: '⚡', title: 'Energie', text: 'Come ricaricare le batterie per fare le cose che ci piacciono senza sentirci distrutti.' }
          ].map((topic, i) => (
            <div key={i} className={`border-3 border-black p-8 shadow-[8px_8px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_black] transition-all flex flex-col items-center text-center ${topic.bg || 'bg-white'}`}>
              <div className="text-4xl mb-4">{topic.emoji}</div>
              <h3 className="font-syne text-2xl font-bold mb-3">{topic.title}</h3>
              <p className="text-sm leading-relaxed text-gray-800">{topic.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buy Me a Coffee Section */}
      <section className="bg-black text-white py-20 px-[5%] border-y-3 border-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block p-4 bg-[#65c962] rounded-full text-black rotate-12">
            <Coffee size={48} />
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-bold uppercase">Offrici un caffè! ☕</h2>
          <p className="text-xl opacity-90">
            Se ti piace quello che facciamo e vuoi supportare il progetto, puoi offrirci un caffè virtuale. Ci aiuta a mantenere il sito attivo e a comprare nuovi libri da riassumere per te!
          </p>
          <a 
            href="https://www.buymeacoffee.com/facnewsletter" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#FFDD00] text-black px-10 py-5 font-bold text-xl uppercase border-3 border-black shadow-[8px_8px_0px_#65c962] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#65c962] transition-all"
          >
            <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="BMC" className="w-8" />
            Buy me a coffee
          </a>
        </div>
      </section>

      {/* Strengths */}
      <section className="max-w-7xl mx-auto my-24 px-[5%]">
        <div className="border-t-4 border-black mb-12"></div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: '⏱️', title: 'Risparmi tempo', text: 'Filtriamo noi la marea di libri e video online. Ti diamo solo il succo, così tu puoi usare il tuo tempo per vivere.' },
            { icon: '🎯', title: 'Tanta pratica', text: 'Niente fuffa motivazionale "credi in te stesso e spaccherai". Solo azioni vere da provare lunedì mattina.' },
            { icon: '💪', title: 'Nessun rimorso', text: 'Se oggi non hai fatto niente, va bene uguale. Promuoviamo un miglioramento sano, non la produttività tossica.' }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-syne text-2xl font-bold">{item.title}</h3>
              <p className="leading-relaxed text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="processo" className="max-w-4xl mx-auto my-32 px-[5%]">
        <div className="text-center mb-20">
          <h2 className="font-syne text-5xl font-bold mb-4">Come nasce ogni edizione.</h2>
          <p className="text-xl font-semibold opacity-70 text-gray-800">Non ci svegliamo illuminati il sabato mattina. C'è un processo dietro (spesso disordinato).</p>
        </div>

        <div className="space-y-20">
          {[
            { num: '01', title: 'Sbattiamo la testa. Ogni giorno.', text: 'Abbiamo gli stessi problemi di chi ci legge: ansia per lo studio, soldi da gestire, difficoltà a concentrarsi e giornate in cui non va dritta una virgola. Invece di far finta di essere perfetti, studiamo soluzioni.', bg: 'bg-[#effaf0]' },
            { num: '02', title: 'Filtriamo il rumore e la fuffa.', text: 'Selezioniamo senza pietà. Buttiamo via i consigli da finti miliardari o da chi ha giornate di 48 ore. Teniamo solo le strategie applicabili alla nostra vita reale.', bg: 'bg-[#65c962]', reverse: true },
            { num: '03', title: 'Te lo scriviamo come al bar.', text: 'Mettiamo tutto in ordine, eliminiamo le parole complicate e ti scriviamo una mail sincera. È come prendersi un caffè tra amici e dirsi: "Oh, sai cosa mi ha svoltato la giornata ieri?".', bg: 'bg-black text-white' }
          ].map((step, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${step.reverse ? 'md:flex-row-reverse' : ''}`}>
              <div className={`w-40 h-40 border-3 border-black shadow-[8px_8px_0px_black] flex items-center justify-center font-syne text-6xl font-bold shrink-0 -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 ${step.bg}`}>
                {step.num}
              </div>
              <div className="flex-grow space-y-4 text-center md:text-left">
                <h3 className="font-syne text-3xl font-bold">{step.title}</h3>
                <p className="text-lg leading-relaxed text-gray-700">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hosts */}
      <section id="hosts" className="max-w-7xl mx-auto my-32 px-[5%]">
        <h2 className="font-syne text-4xl font-bold uppercase mb-12">I tuoi compagni di banco</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-black text-white border-3 border-black p-10 shadow-[6px_6px_0px_black]">
            <span className="font-syne text-sm opacity-70 uppercase mb-4 block">21 ANNI • DIPENDENTE INCASINATO</span>
            <h3 className="font-syne text-4xl font-bold text-[#65c962] uppercase mb-4">Alex</h3>
            <p className="text-lg opacity-90">Quello che cerca la logica. Cerco di incastrare lavoro, vita e salute mentale senza andare in burnout. Traduco la teoria noiosa in mosse di sopravvivenza quotidiana.</p>
          </div>
          <div className="bg-white border-3 border-black p-10 shadow-[6px_6px_0px_black]">
            <span className="font-syne text-sm opacity-70 uppercase mb-4 block">18 ANNI • STUDENTE SOTTO PRESSIONE</span>
            <h3 className="font-syne text-4xl font-bold uppercase mb-4">Filippo</h3>
            <p className="text-lg text-gray-800">Quello in trincea. Lotto con l'ansia delle aspettative, esploro il minimalismo e cerco modi per studiare senza farmi prosciugare l'anima. E spesso sbaglio.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="iscriviti" className="max-w-3xl mx-auto my-32 px-[5%]">
        <div className="border-3 border-black bg-white p-12 shadow-[12px_12px_0px_#65c962]">
          <h2 className="font-syne text-4xl font-bold leading-none mb-4">Unisciti al disastro.</h2>
          <p className="text-lg mb-8">Scherziamo, ma non troppo. Inserisci la mail per ricevere i nostri appunti su come affrontare la vita reale, una settimana alla volta.</p>
          
          <form 
            action="https://d690bcd6.sibforms.com/serve/MUIFAGtpXnks_ZUkQPN4AioSFbyi45YvznGS4OQrHI1EY6Nys7Fz8Bw5HgFCDjvjNBHfsjz-ImXrbQSNCpyuIr2MEWl_nGq2zSgxB4vxDeLBffKzL9W2nTACMLcuVr1U7jKscHhbIX1OVOiFo2PWa2JIFswn3T3hEbx14bnjA0yts1KW8Gy4xQWy5h0N_86GKmgAlDYBiWAnyonH4w==" 
            method="POST"
            className="space-y-4"
          >
            <input type="email" name="EMAIL" placeholder="La tua email (giuriamo, zero spam)" required className="w-full p-4 border-2 border-black bg-gray-50 font-semibold focus:outline-none focus:bg-[#65c962] transition-all" />
            <button type="submit" className="w-full bg-black text-white py-4 font-bold text-xl uppercase hover:bg-[#65c962] hover:text-black transition-all">Sì, voglio le mail 📩</button>
          </form>
          <p className="text-xs text-center mt-4 opacity-60">Cancellati con un clic se ti stufi. Nessun rancore.</p>
        </div>
      </section>

      <footer className="bg-black text-white py-16 px-[5%] text-center font-syne">
        <h2 className="text-[#65c962] text-4xl font-bold mb-4">FAC.</h2>
        <p>&copy; 2026 Alex & Filippo. Respira e vai avanti.</p>
        <p className="text-xs opacity-50 mt-4">flipgrow0@gmail.com</p>
        <button onClick={() => setView('admin')} className="mt-8 text-xs underline opacity-50 hover:opacity-100">Area Admin</button>
      </footer>
    </div>
  );

  const renderBlog = () => (
    <div className="min-h-screen bg-white text-[#121212] font-inter">
      <nav className="flex justify-between items-center px-[5%] py-5 bg-white border-b-3 border-black sticky top-0 z-[1000]">
        <button onClick={() => setView('landing')} className="flex items-center gap-2 font-syne font-bold uppercase hover:underline">
          <ArrowLeft size={20} /> Torna alla Home
        </button>
        <div className="font-syne text-2xl font-extrabold">FAC BLOG</div>
        {isAdmin && (
          <button onClick={() => setView('admin')} className="bg-black text-white px-4 py-2 font-bold uppercase text-xs">Admin</button>
        )}
      </nav>

      <div className="max-w-5xl mx-auto py-16 px-[5%]">
        <h1 className="font-syne text-5xl font-bold uppercase mb-12 border-b-4 border-black pb-4">Tutti gli articoli</h1>
        
        {articles.length === 0 ? (
          <div className="text-center py-20 border-3 border-dashed border-black">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold opacity-40 uppercase">Ancora nessun articolo pubblicato.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {articles.map((article) => (
              <motion.article 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer border-3 border-black bg-white shadow-[8px_8px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_black] transition-all overflow-hidden"
                onClick={() => {
                  setSelectedArticle(article);
                  setView('article');
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {article.imageUrl && (
                    <div className="md:w-1/3 h-64 md:h-auto overflow-hidden border-b-3 md:border-b-0 md:border-r-3 border-black">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="p-8 flex-grow space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <User size={14} /> {article.author} • {article.createdAt?.toDate().toLocaleDateString('it-IT')}
                    </div>
                    <h2 className="font-syne text-3xl font-bold group-hover:text-[#65c962] transition-colors">{article.title}</h2>
                    <p className="text-gray-600 line-clamp-3">{article.content.substring(0, 200)}...</p>
                    <div className="flex items-center gap-1 font-bold uppercase text-sm group-hover:gap-2 transition-all">
                      Leggi tutto <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderArticle = () => {
    if (!selectedArticle) return null;
    return (
      <div className="min-h-screen bg-white text-[#121212] font-inter">
        <nav className="flex justify-between items-center px-[5%] py-5 bg-white border-b-3 border-black sticky top-0 z-[1000]">
          <button onClick={() => setView('blog')} className="flex items-center gap-2 font-syne font-bold uppercase hover:underline">
            <ArrowLeft size={20} /> Blog
          </button>
          <div className="font-syne text-xl font-bold truncate max-w-[200px] md:max-w-none">{selectedArticle.title}</div>
          <div className="w-20"></div>
        </nav>

        <article className="max-w-3xl mx-auto py-16 px-[5%]">
          {selectedArticle.imageUrl && (
            <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full border-3 border-black shadow-[8px_8px_0px_black] mb-12" referrerPolicy="no-referrer" />
          )}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold uppercase opacity-60">
                <User size={16} /> {selectedArticle.author} • {selectedArticle.createdAt?.toDate().toLocaleDateString('it-IT')}
              </div>
              <h1 className="font-syne text-4xl md:text-6xl font-bold leading-tight uppercase">{selectedArticle.title}</h1>
            </div>
            
            <div className="prose prose-lg max-w-none font-inter leading-relaxed text-gray-800">
              <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
            </div>
          </div>
          
          <div className="mt-20 pt-12 border-t-4 border-black text-center">
            <h3 className="font-syne text-2xl font-bold uppercase mb-4">Ti è piaciuto l'articolo?</h3>
            <p className="mb-8">Iscriviti alla newsletter per non perdere i prossimi!</p>
            <button onClick={() => setView('landing')} className="bg-[#65c962] border-3 border-black px-8 py-4 font-bold uppercase shadow-[6px_6px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">Iscriviti Ora</button>
          </div>
        </article>
      </div>
    );
  };

  const renderAdmin = () => {
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#effaf0] p-5">
          <div className="bg-white border-3 border-black p-10 shadow-[8px_8px_0px_black] text-center space-y-6 max-w-md">
            <h1 className="font-syne text-3xl font-bold uppercase">Area Riservata</h1>
            <p>Solo Alex e Filippo possono entrare qui per pubblicare nuovi articoli.</p>
            <button onClick={login} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-[#65c962] hover:text-black transition-all">Accedi con Google</button>
            <button onClick={() => setView('landing')} className="text-sm underline opacity-50">Torna alla Home</button>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-5">
          <div className="bg-white border-3 border-black p-10 shadow-[8px_8px_0px_black] text-center space-y-6 max-w-md">
            <h1 className="font-syne text-3xl font-bold uppercase text-red-600">Accesso Negato</h1>
            <p>Spiacenti, non hai i permessi per accedere a questa area.</p>
            <button onClick={logout} className="w-full bg-black text-white py-4 font-bold uppercase transition-all">Esci</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#effaf0] font-inter">
        <nav className="flex justify-between items-center px-[5%] py-5 bg-white border-b-3 border-black sticky top-0 z-[1000]">
          <button onClick={() => setView('landing')} className="font-syne font-bold uppercase hover:underline">Home</button>
          <div className="font-syne text-2xl font-extrabold uppercase">Admin Panel</div>
          <button onClick={logout} className="flex items-center gap-2 bg-red-100 px-3 py-1 border-2 border-black text-xs font-bold uppercase"><LogOut size={14} /> Esci</button>
        </nav>

        <div className="max-w-4xl mx-auto py-12 px-[5%] space-y-12">
          <div className="bg-white border-3 border-black p-8 shadow-[8px_8px_0px_black]">
            <h2 className="font-syne text-3xl font-bold uppercase mb-8 flex items-center gap-3"><Plus className="bg-[#65c962] p-1 rounded" /> Nuovo Articolo</h2>
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase opacity-60">Titolo</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="w-full p-4 border-2 border-black bg-gray-50 font-bold focus:bg-[#effaf0] outline-none" placeholder="Inserisci il titolo..." />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-60">URL Immagine</label>
                  <input value={newImage} onChange={e => setNewImage(e.target.value)} className="w-full p-4 border-2 border-black bg-gray-50 focus:bg-[#effaf0] outline-none" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-60">Autore</label>
                  <select value={newAuthor} onChange={e => setNewAuthor(e.target.value)} className="w-full p-4 border-2 border-black bg-gray-50 font-bold focus:bg-[#effaf0] outline-none">
                    <option value="Alex">Alex</option>
                    <option value="Filippo">Filippo</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase opacity-60">Contenuto (Markdown)</label>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} required rows={10} className="w-full p-4 border-2 border-black bg-gray-50 focus:bg-[#effaf0] outline-none font-mono text-sm" placeholder="Scrivi qui il tuo articolo in Markdown..." />
              </div>
              <button type="submit" className="w-full bg-[#65c962] text-black py-5 border-3 border-black font-bold text-xl uppercase shadow-[6px_6px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] transition-all flex items-center justify-center gap-3">
                <Send size={24} /> Pubblica Articolo
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="font-syne text-2xl font-bold uppercase">Articoli Pubblicati ({articles.length})</h2>
            <div className="grid gap-4">
              {articles.map(article => (
                <div key={article.id} className="bg-white border-2 border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_black]">
                  <div>
                    <h4 className="font-bold">{article.title}</h4>
                    <p className="text-xs opacity-50 uppercase">{article.author} • {article.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border-2 border-black hover:bg-gray-100"><Edit3 size={18} /></button>
                    <button className="p-2 border-2 border-black hover:bg-red-100 text-red-600"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-black border-t-[#65c962] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'landing' && renderLanding()}
        {view === 'blog' && renderBlog()}
        {view === 'article' && renderArticle()}
        {view === 'admin' && renderAdmin()}
      </motion.div>
    </AnimatePresence>
  );
}
