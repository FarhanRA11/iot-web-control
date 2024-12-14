'use client';

import { get, set, ref, child } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from './firebaseConfig';

export default function App() {
  const [value, setValue] = useState(0); // Default nilai aman (0)
  const [isLoading, setIsLoading] = useState(true); // Untuk memastikan data awal selesai di-load

  // Fetch initial value from Firebase on component mount
  useEffect(() => {
    const fetchValue = async () => {
      try {
        const snapshot = await get(child(ref(database), 'LED/'));
        if (snapshot.exists()) {
          setValue(snapshot.val().analog || 0); // Gunakan 0 jika `analog` undefined
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
          await set(ref(database, 'LED/'), { analog: value });
        } catch (error) {
          console.error('Error updating data:', error);
        }
      };
      updateValue();
    }
  }, [value, isLoading]); // Runs whenever `value` changes

  // Render component hanya jika data telah diambil
  return (
    <div className='flex flex-col items-center m-10'>
      <p>kecerahan LED</p>
      {!isLoading ? (
        <>
          <input
            onChange={(e) => setValue(Number(e.target.value))} // Convert input to number
            type="range"
            value={value}
            min={0}
            max={255}
            className='center w-full h-10 rounded-md border border-gray-400'
          />
          <p>{((value * 100) / 255).toPrecision(3)}%</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
