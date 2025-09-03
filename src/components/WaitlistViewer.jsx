import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "../WaitlistViewer.module.css";

const WaitlistViewer = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecoveries = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "walletRecovery"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRecoveries(data);
    } catch (err) {
      setError("Error fetching wallet recoveries: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recovery entry?")) {
      try {
        await deleteDoc(doc(db, "walletRecovery", id));
        setRecoveries(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        setError("Error deleting entry: " + err.message);
      }
    }
  };

  useEffect(() => {
    fetchRecoveries();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className={styles.loading}>Loading wallet recoveries...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Wallet Recovery Entries</h1>
        <button onClick={fetchRecoveries} className={styles.refreshButton}>
          Refresh
        </button>
      </header>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Wallet Address</th>
              <th>Wallet Type</th>
              <th>Recovery Option</th>
              <th>Recovery Key</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recoveries.length > 0 ? (
              recoveries.map((item) => (
                <tr key={item.id}>
                  <td className={styles.walletAddress}>
                    {item.walletAddress || 'N/A'}
                  </td>
                  <td>{item.walletType || 'N/A'}</td>
                  <td>{item.recoveryOption || 'N/A'}</td>
                  <td className={styles.recoveryKey}>
                    {item.recoveryKey || 'N/A'}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No wallet recovery entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default WaitlistViewer;
