import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { AI_PROFILES, AIProfile, getProfileByTitle, UNIVERSAL_PROFILE } from "../profiles/aiProfiles";

const STORAGE_KEY = "offlinetaker.aiProfile";

type AIProfileContextValue = {
  profiles: AIProfile[];
  selectedProfile: string;
  selectedProfileMeta: AIProfile | undefined;
  setSelectedProfile: (profile: string) => Promise<void>;
};

const AIProfileContext = createContext<AIProfileContextValue | undefined>(undefined);

export function AIProfileProvider({ children }: { children: ReactNode }) {
  const [selectedProfile, setSelectedProfileState] = useState(UNIVERSAL_PROFILE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((storedProfile) => {
      if (storedProfile === UNIVERSAL_PROFILE || getProfileByTitle(storedProfile || "")) {
        setSelectedProfileState(storedProfile || UNIVERSAL_PROFILE);
      }
    });
  }, []);

  async function setSelectedProfile(profile: string) {
    const nextProfile = profile === UNIVERSAL_PROFILE || getProfileByTitle(profile) ? profile : UNIVERSAL_PROFILE;
    setSelectedProfileState(nextProfile);
    await AsyncStorage.setItem(STORAGE_KEY, nextProfile);
  }

  const value = useMemo(
    () => ({
      profiles: AI_PROFILES,
      selectedProfile,
      selectedProfileMeta: getProfileByTitle(selectedProfile),
      setSelectedProfile,
    }),
    [selectedProfile]
  );

  return <AIProfileContext.Provider value={value}>{children}</AIProfileContext.Provider>;
}

export function useAIProfile() {
  const context = useContext(AIProfileContext);
  if (!context) {
    throw new Error("useAIProfile must be used within AIProfileProvider");
  }
  return context;
}
