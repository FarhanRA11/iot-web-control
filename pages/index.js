import { get, set, ref, child } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/firebaseConfig.js';

export default function Home() {
  const [value, setValue] = useState(0); // Default nilai aman (0)
  const [isLoading, setIsLoading] = useState(true); // Untuk memastikan data awal selesai di-load
  const [isListening, setIsListening] = useState(false); // Untuk melacak status mendengarkan
  const [message, setMessage] = useState(''); // Untuk menyimpan pesan status

  // Fetch initial value from Firebase on component mount
  useEffect(() => {
    const fetchValue = async () => {
      try {
        const snapshot = await get(child(ref(database), 'LED/'));
        if (snapshot.exists()) {
          setValue(Number((snapshot.val().analog * 100 / 255).toFixed(0)) || 0); // Gunakan 0 jika `analog` undefined
        } else {
          console.log('No data available, using default value');
          setValue(0); // Nilai default jika tidak ada data
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false); // Menandakan bahwa loading selesai
      }
    };
    fetchValue();
  }, []); // Empty dependency array ensures this runs once on mount

  // Update Firebase when `value` changes
  useEffect(() => {
    // Hindari update jika masih loading
    if (!isLoading) {
      const updateValue = async () => {
        try {
          await set(ref(database, 'LED/'), { analog: Number((value * 255 / 100).toFixed(0)) });
        } catch (error) {
          console.error('Error updating data:', error);
        }
      };
      updateValue();
    }
  }, [value, isLoading]); // Runs whenever `value` changes

  // Voice command handler
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Hentikan setelah menerima satu perintah
    recognition.lang = 'id-ID'; // Bahasa Indonesia

    const startListening = () => {
      setIsListening(true);
      setMessage('Mendengarkan...'); // Tampilkan pesan saat mendengarkan
      recognition.start();
    };

    const stopListening = () => {
      setIsListening(false);
      recognition.stop();
    };

    recognition.onresult = (event) => {
      let commandRecognized = false; // Flag untuk melacak apakah command sesuai

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const command = event.results[i][0].transcript.trim().toLowerCase();
          console.log('Command:', command);

          const match = command.match(/kecerahan\s(\d+)%/); // Regex untuk menangkap angka
          if (match) {
            const brightness = Math.min(Math.max(parseInt(match[1], 10), 0), 100); // Jaga dalam rentang 0-100
            setValue(brightness); // Ubah nilai slider
            setMessage(`Kecerahan diatur ke ${brightness}%`);
            commandRecognized = true;
            break; // Keluar dari loop setelah command diterima
          }
        }
      }

      if (!commandRecognized) {
        setMessage('Perintah tidak diketahui'); // Tampilkan pesan jika tidak sesuai
      }

      stopListening(); // Hentikan recognition setelah menerima perintah
    };

    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
      setMessage('Terjadi kesalahan saat mendengarkan'); // Tampilkan pesan error
      stopListening();
    };

    // Start and stop voice commands based on `isListening`
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }

    // Clean up
    return () => {
      stopListening();
    };
  }, [isListening]);

  // Render component hanya jika data telah diambil
  return (
    <div className='flex flex-col items-center m-10'>
      <p className='text-xl'>Kecerahan LED</p>
      {!isLoading ? (
        <>
          <input
            onChange={(e) => setValue(Number(e.target.value))} // Convert input to number
            type="range"
            value={value}
            min={0}
            max={100}
            className='center w-full h-10 rounded-md border border-gray-400'
          />
          <p className='text-xl'>{value}%</p>
          <button
            onClick={() => setIsListening((prev) => !prev)}
            className='mt-5 px-4 py-2 bg-blue-500 text-white rounded-md'>
            {isListening ? <img src='/micOff.svg' alt='Mic Off' className='w-5 h-5' /> : <img src='/micOn.svg' alt='Mic On' className='w-5 h-5' />}
          </button>
          {message && <p className='mt-3 text-red-500'>{message}</p>}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
