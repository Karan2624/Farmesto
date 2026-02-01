import { useUser } from "@clerk/nextjs"; // 1. Change to Clerk
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function useStoreUser() {
  const { isAuthenticated } = useConvexAuth();
  
  // 2. Use the Clerk hook instead of Auth0
  const { user } = useUser(); 

  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    // If the user is not logged in don't do anything
    if (!isAuthenticated) {
      return;
    }

    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }

    createUser();

    return () => setUserId(null);
    
    // 3. Update dependency: Clerk uses 'user.id', not 'user.sub'
  }, [isAuthenticated, storeUser, user?.id]); 

  return userId;
}