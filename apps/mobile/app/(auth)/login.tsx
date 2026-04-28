import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmail, signInWithGoogle } from "../../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Lütfen e-posta ve şifre giriniz.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      // Başarılı olursa root layout bizi yönlendirecek (/tabs veya /onboarding)
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError("Google ile giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-4">
              <Ionicons name="leaf" size={40} color="#4CAF50" />
            </View>
            <Text className="text-3xl font-bold text-primary">Calorie Coach</Text>
            <Text className="text-base text-text-secondary mt-2">
              Sağlıklı yaşam yolculuğuna başla
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1">E-posta</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="mail-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-1 ml-1 mt-4">Şifre</Text>
              <View className="flex-row items-center bg-white rounded-button border border-border focus:border-primary px-4 h-14">
                <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary outline-none"
                  placeholder="••••••••"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9E9E9E"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text className="text-error text-sm ml-1 mt-2">{error}</Text> : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`h-14 rounded-button items-center justify-center mb-6 ${
              loading ? "bg-primary-light" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Giriş Yap</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="text-text-hint px-4 font-medium">veya</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading}
            className="flex-row h-14 bg-white rounded-button border border-border items-center justify-center mb-8"
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" className="mr-3" />
            <Text className="text-text-primary text-base font-semibold ml-2">
              Google ile Giriş Yap
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-auto">
            <Text className="text-text-secondary">Hesabın yok mu? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Kayıt Ol</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
