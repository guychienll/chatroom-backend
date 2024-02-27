import serviceAccount from "../service-account.json";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const firebaseApp = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = getFirestore(firebaseApp);

export default db;
