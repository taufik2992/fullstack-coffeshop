import { api } from "@/services/api";
import React, { useEffect, useState } from "react";
import { Text, View, Button, ActivityIndicator } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ success: boolean; message?: string }>(
          "health"
        );
        setStatus(res?.message || (res.success ? "OK" : "Unknown"));
      } catch (err: any) {
        setError(err.message || "Request failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      {loading ? <ActivityIndicator size="large" /> : null}
      {status ? (
        <Text style={{ fontSize: 18, marginBottom: 8 }}>API: {status}</Text>
      ) : null}
      {error ? (
        <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
      ) : null}
      <Button
        title="Retry"
        onPress={() => {
          setLoading(true);
          setError(null);
          setStatus(null);
          setTimeout(() => window.location.reload(), 200);
        }}
      />
      <Text style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        API Base: {api.API_BASE}
      </Text>
    </View>
  );
}
