import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { 
  Dumbbell, 
  Wind, 
  Target, 
  Calendar, 
  Instagram, 
  MessageCircle, 
  Info, 
  Zap, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  ChevronLeft
} from 'lucide-react';

// --- Firebase Config ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'observacion-interna-sol';

// --- Brand Data from PDF ---
const BRAND = {
  name: "Observación Interna",
  tagline: "Movimiento & Autoconocimiento",
  coach: "Sol",
  bio: "Paradista de Manos. Entrenadora de Fuerza, Flexibilidad y Verticales. Formada en Hatha Yoga, Musculación, Funcional y Pilates Clásico.",
  locations: [
    { name: "Patagonia Centro", address: "Belgrano 845" },
    { name: "Estudio Flu-í", address: "Av. San Martín 836, 2do piso" }
  ]
};

const PACKS = [
  { sessions: "4 a 6", price: 60000, color: "bg-orange-50" },
  { sessions: "8 a 10", price: 80000, color: "bg-orange-100" },
  { sessions: "12 o +", price: 105000, color: "bg-orange-200" }
];

const SCHEDULE = [
  { time: "12:00", mon: "Flex: Aula Abierta", tue: "Fuerza 1-2", wed: "Flex: Sesión Guiada", thu: "Fuerza 1-2", fri: "Privado Flex" },
  { time: "19:00", mon: "Fuerza 1-2", tue: "Fuerza 0-1", wed: "H.I.I.T", thu: "Fuerza 0-1", fri: "Flex: Guiada" },
  { time: "20:00", mon: "Fuerza 1-2", tue: "Fuerza 0-1", wed: "Fuerza 1-2", thu: "Verticales", fri: "Fuerza 1-2" }
];

// --- Components ---

const StudentCheckIn = ({ onSave }) => {
  const [feeling, setFeeling] = useState(3);
  const [focus, setFocus] = useState('');
  const [energy, setEnergy] = useState('Moderada');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!focus) return;
    onSave({ feeling, focus, energy, timestamp: new Date() });
    setFocus('');
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Target size={20} className="text-orange-500" />
        Tu Registro de Hoy
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado de Disponibilidad</label>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button 
                key={n} type="button" 
                onClick={() => setFeeling(n)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${feeling === n ? 'bg-orange-500 text-white scale-110 shadow-lg' : 'bg-orange-50 text-orange-300'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2">
            <span>RÍGIDO/CANSADO</span>
            <span>DISPONIBLE/FLUIDO</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foco de la Práctica</label>
          <input 
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ej: Empuje, Apertura de hombros..."
            className="w-full mt-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
          Registrar Observación
        </button>
      </form>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'daily_checks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });
    return () => unsubscribe();
  }, [user]);

  const saveLog = async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'daily_checks'), {
      ...data,
      timestamp: Timestamp.now()
    });
  };

  return (
    <div className="min-h-screen bg-[#FEFDFB] text-slate-800 font-sans pb-24">
      {/* Header Estilo Sol */}
      <header className="p-8 pt-12 flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-[1px] border-slate-900 flex items-center justify-center p-1">
             <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-200 to-yellow-100 opacity-80 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center font-serif text-3xl font-light">oi</div>
        </div>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 uppercase">
            Observación <span className="font-bold">Interna</span>
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-slate-500 uppercase mt-1">Movimiento & Autoconocimiento</p>
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-8">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Intro Bio */}
            <div className="bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 italic">Hola, soy Sol.</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Abro espacios destinados a explorar, sentir y potenciar la herramienta más inteligente y poderosa que tenemos: nuestro cuerpo.
                </p>
                <div className="flex gap-2">
                  <a href="https://www.instagram.com/observacion.interna" className="bg-slate-900 text-white p-2 rounded-lg"><Instagram size={18} /></a>
                  <button onClick={() => setActiveTab('horarios')} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg text-orange-600">
                    Ver Intensivos <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <StudentCheckIn onSave={saveLog} />

            {/* Testimonios */}
            <div className="bg-slate-50 p-6 rounded-[2rem]">
               <div className="flex gap-1 mb-2">
                 {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-orange-400 text-orange-400" />)}
               </div>
               <p className="text-xs italic text-slate-600">"El sentir fue de expansión... cuánto oxígeno que ingresó y recibió este cuerpo. Gracias por ser tremenda guía."</p>
            </div>
          </div>
        )}

        {activeTab === 'horarios' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-orange-500" /> Intensivos de Verano
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] bg-white rounded-2xl overflow-hidden border border-orange-50 shadow-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="p-3 text-left">HORA</th>
                    <th className="p-3">LUN</th>
                    <th className="p-3">MAR</th>
                    <th className="p-3">MIÉ</th>
                    <th className="p-3">JUE</th>
                    <th className="p-3">VIE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {SCHEDULE.map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold bg-slate-50">{row.time}</td>
                      <td className="p-2 text-center">{row.mon}</td>
                      <td className="p-2 text-center font-medium">{row.tue}</td>
                      <td className="p-2 text-center">{row.wed}</td>
                      <td className="p-2 text-center font-medium">{row.thu}</td>
                      <td className="p-2 text-center">{row.fri}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-slate-700 mt-8"><MapPin size={16} /> Sedes</h3>
              {BRAND.locations.map(loc => (
                <div key={loc.name} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                  <span className="text-sm font-medium">{loc.name}</span>
                  <span className="text-xs text-slate-400">{loc.address}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'precios' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-orange-500" /> Aranceles '26
            </h2>
            <div className="grid gap-4">
              {PACKS.map(pack => (
                <div key={pack.sessions} className={`${pack.color} p-6 rounded-3xl flex justify-between items-center border border-black/5`}>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">Pack de Sesiones</p>
                    <p className="text-2xl font-black italic">{pack.sessions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${pack.price.toLocaleString('es-AR')}</p>
                    <p className="text-[10px] text-slate-500">EFECTIVO / TRANSFERENCIA</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-3xl">
              <h4 className="font-bold flex items-center gap-2 mb-2"><CheckCircle2 size={16} /> ¿Qué incluyen?</h4>
              <ul className="text-xs space-y-2 opacity-80">
                <li>• Grupos reducidos (Máx 5 personas)</li>
                <li>• Diseño personalizado de rutina</li>
                <li>• Posibilidad de recuperar sesiones</li>
                <li>• 10% OFF combinando disciplinas</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History size={20} className="text-orange-500" /> Tu Proceso
            </h2>
            {logs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-orange-200">
                <Wind className="mx-auto text-orange-200 mb-4" size={40} />
                <p className="text-slate-400 text-sm italic">Comienza a registrar tus sensaciones para ver tu evolución.</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-white p-5 rounded-3xl border border-orange-50 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full ${log.feeling > 3 ? 'bg-green-400' : 'bg-orange-300'}`}></div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                         {log.timestamp?.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'daily_checks', log.id))} className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Foco: {log.focus}</p>
                  <p className="text-xs text-slate-500 italic">"Sentí el cuerpo en nivel {log.feeling} de disponibilidad"</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Nav Circular Minimalista */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md border border-orange-100 rounded-full shadow-2xl p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-full transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>
          <Heart size={20} />
        </button>
        <button onClick={() => setActiveTab('horarios')} className={`p-4 rounded-full transition-all ${activeTab === 'horarios' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>
          <Clock size={20} />
        </button>
        <button onClick={() => setActiveTab('precios')} className={`p-4 rounded-full transition-all ${activeTab === 'precios' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>
          <Zap size={20} />
        </button>
        <button onClick={() => setActiveTab('historial')} className={`p-4 rounded-full transition-all ${activeTab === 'historial' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>
          <Activity size={20} />
        </button>
      </nav>

    </div>
  );
}

// Icono faltante
function Activity({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function History({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function Trash2({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

